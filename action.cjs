const fs = require('fs')
const { spawn } = require('child_process')

const CONSOLE_BLUE = '\x1B[0;34m'
const CONSOLE_RED = '\x1b[0;31m'
const RESET_CONSOLE_COLOR = '\x1b[0m'

function runCommand () {
  const args = Array.prototype.slice.call(arguments)
  return new Promise((resolve, reject) => {
    const childProcess = spawn.apply(null, args)

    childProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`)
    })

    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`)
    })

    childProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command exited with code ${code}`))
      } else {
        resolve()
      }
    })
  })
}

module.exports = async ({ github, context, inputs, actionPath, core, debug }) => {
  const debugLog = debug ? console.log : () => {}

  if (inputs.enabled !== 'true') { return }
  debugLog('Security Action enabled')
  // reviewdog-enabled-pr steps
  const reviewdogEnabledPr = inputs.baseline_scan_only !== 'false' && process.env.GITHUB_EVENT_NAME === 'pull_request' && context.payload.pull_request.draft === false && context.actor !== 'dependabot[bot]'
  debugLog(`Security Action enabled for PR: ${reviewdogEnabledPr}, baseline_scan_only: ${inputs.baseline_scan_only}, GITHUB_EVENT_NAME: ${process.env.GITHUB_EVENT_NAME}, context.actor: ${context.actor}, context.payload.pull_request.draft: ${context.payload.pull_request?.draft}`)
  // reviewdog-enabled-full steps
  const reviewdogEnabledFull = !reviewdogEnabledPr && (inputs.baseline_scan_only === 'false' || process.env.GITHUB_EVENT_NAME === 'workflow_dispatch')
  debugLog(`Security Action enabled for full: ${reviewdogEnabledFull}, baseline_scan_only: ${inputs.baseline_scan_only}, GITHUB_EVENT_NAME: ${process.env.GITHUB_EVENT_NAME}`)
  // reviewdog-enabled steps
  if (!reviewdogEnabledPr && !reviewdogEnabledFull) { return }
  debugLog('Security Action enabled for reviewdog')

  // Install semgrep & pip-audit
  await runCommand(`pip install --disable-pip-version-check -r ${actionPath}/requirements.txt`, { shell: true })
  debugLog('Installed semgrep & pip-audit')
  // Install xmllint for safesvg
  await runCommand('sudo apt-get install -y libxml2-utils', { shell: true })
  debugLog('Installed xmllint')

  // debug step
  if (inputs.debug === 'true') {
    const env = {
      ...process.env,
      ASSIGNEES: inputs.assignees
    }
    await runCommand(`${actionPath}/assets/debug.sh`, { env })
    debugLog('Debug step completed')
  }

  // run-reviewdog-full step
  if (reviewdogEnabledFull) {
    const env = { ...process.env }
    delete env.GITHUB_BASE_REF
    await runCommand(`${actionPath}/assets/reviewdog.sh`, { env })
    debugLog('Reviewdog full step completed')
  }

  if (reviewdogEnabledPr) {
    // changed-files steps
    const { default: pullRequestChangedFiles } = await import(`${actionPath}/src/pullRequestChangedFiles.js`)
    const changedFiles = await pullRequestChangedFiles({ github, owner: context.repo.owner, name: context.repo.repo, prnumber: context.payload.pull_request.number })
    debugLog('Changed files:', changedFiles)

    // Write changed files to file
    fs.writeFileSync(`${actionPath}/assets/all_changed_files.txt`, changedFiles.join('\0'))
    debugLog('Wrote changed files to file')

    // comments-before steps
    const { default: commentsNumber } = await import(`${actionPath}/src/steps/commentsNumber.js`)
    const { default: cleanupComments } = await import(`${actionPath}/src/steps/cleanupComments.js`)
    debugLog('Comments before:', await commentsNumber({ context, github }))

    const commentsBefore = await commentsNumber({ context, github })
    await cleanupComments({ context, github })

    // unverified-commits steps
    const { default: unverifiedCommits } = await import(`${actionPath}/src/steps/unverifiedCommits.js`)

    // add unverified-commits label step
    const unverifiedCommitsSteps = await unverifiedCommits({ context, github })
    if (unverifiedCommitsSteps === '"UNVERIFIED-CHANGED"') {
      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        labels: ['unverified-commits']
      })
      debugLog('Added unverified-commits label')
    }

    // run-reviewdog-pr step
    const env = {
      ...process.env,
      ASSIGNEES: inputs.assignees,
      REVIEWDOG_GITHUB_API_TOKEN: inputs.github_token,
      SEC_ACTION_DEBUG: inputs.debug,
      PYPI_INDEX_URL: inputs.pip_audit_pypi_index_url,
      PYPI_INSECURE_HOSTS: inputs.pip_audit_pypi_insecure_hosts
    }
    await runCommand(`${actionPath}/assets/reviewdog.sh`, { env })
    debugLog('Reviewdog PR step completed')

    // comments-after step
    const commentsAfter = await commentsNumber({ context, github })
    debugLog('Comments after:', commentsAfter)

    // assignees-after step
    const { default: assigneesAfter } = await import(`${actionPath}/src/steps/assigneesAfter.js`)
    const assigneesAfterVal = await assigneesAfter({ context, github, assignees: inputs.assignees })
    debugLog('Assignees after:', assigneesAfterVal)

    // assignee-removed-label step
    const { default: assigneeRemoved } = await import(`${actionPath}/src/steps/assigneeRemoved.js`)
    const assigneeRemovedLabel = await assigneeRemoved({ context, github, assignees: assigneesAfterVal })
    debugLog('Assignee removed:', assigneeRemovedLabel)

    // add description-contains-hotwords step
    const { default: hotwords } = await import(`${actionPath}/src/steps/hotwords.js`)
    const descriptionContainsHotwords = (context.actor !== 'renovate[bot]') ? await hotwords({ context, github, hotwords: inputs.hotwords }) : false
    debugLog('Description contains hotwords:', descriptionContainsHotwords)

    // add should-trigger label step
    const shouldTrigger = reviewdogEnabledPr && !assigneeRemovedLabel && ((commentsBefore < commentsAfter) || descriptionContainsHotwords)
    debugLog('Should trigger:', shouldTrigger)

    if (shouldTrigger) {
      // add label step
      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        labels: ['needs-security-review']
      })
      debugLog('Added needs-security-review label')
      // add assignees step
      await github.rest.issues.addAssignees({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        assignees: assigneesAfterVal.split(/\s+/).filter((str) => str !== '')
      })
      debugLog('Added assignees')
    }

    const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)

    const message = `Repository: [${process.env.GITHUB_REPOSITORY}](https://github.com/${process.env.GITHUB_REPOSITORY})\npull-request: ${context.payload.pull_request.html_url}\nFindings: ${commentsAfter}`

    let githubToSlack = {}
    try {
      githubToSlack = JSON.parse(inputs.gh_to_slack_user_map)
    } catch (e) {
      console.log('GH_TO_SLACK_USER_MAP is not valid JSON')
    }

    // assignees-slack step
    const assignees = assigneesAfterVal.toLowerCase().split(/\s+/).map(e => e.trim()).filter(Boolean)
    const slackAssignees = assignees.map(m => githubToSlack[m] ? githubToSlack[m] : `@${m}`).join(' ')
    core.setSecret(slackAssignees)
    debugLog('Slack assignees:', slackAssignees)

    // actor-slack step
    const actor = githubToSlack[context.actor] ? githubToSlack[context.actor] : `@${context.actor}`
    core.setSecret(actor)

    if (fs.existsSync('reviewdog.fail.log')) {
      // print reviewdog.fail.log to the console
      const log = fs.readFileSync('reviewdog.fail.log', 'UTF-8').replaceAll(/^/g, CONSOLE_BLUE)
      console.log(`${CONSOLE_RED}This action encountered an error while reporting the following findings via the Github API:`)
      console.log(log)
      console.log(`${CONSOLE_RED}The failure of this action should not prevent you from merging your PR. Please report this failure to the maintainers of https://github.com/brave/security-action ${RESET_CONSOLE_COLOR}`)
      debugLog('Error log printed to console')

      if (inputs.slack_token) {
        // reviewdog-fail-log-head step
        const reviewdogFailLogHead = '\n' + fs.readFileSync('reviewdog.fail.log', 'UTF-8').split('\n').slice(0, 4).join('\n')
        debugLog('Reviewdog fail log head:', reviewdogFailLogHead)

        // send error slack message, if there is any error
        await sendSlackMessage({
          token: inputs.slack_token,
          text: `[error] ${actor} action failed, plz take a look. /cc ${slackAssignees} ${reviewdogFailLogHead}`,
          message,
          channel: '#secops-hotspots',
          color: 'red',
          username: 'security-action'
        })
        debugLog('Sent error slack message')
      } else {
        // throw error if no slack token is provided, and there is an error log
        debugLog('Error was thrown and Slack token is missing, exiting eagerly!')
        throw new Error('Error was thrown and Slack token is missing, exiting eagerly!')
      }
    }

    if (inputs.slack_token && shouldTrigger) {
      // Send slack message, if there are any findings
      await sendSlackMessage({
        token: inputs.slack_token,
        text: `[security-action] ${actor} pushed commits. /cc ${slackAssignees}`,
        message,
        channel: '#secops-hotspots',
        color: 'green',
        username: 'security-action'
      })
      debugLog('Comments after:', commentsAfter)
    }
  }
}
