const fs = require('fs')
const os = require('os')
const { spawn } = require('child_process')

const CONSOLE_BLUE = '\x1B[0;34m'
const CONSOLE_RED = '\x1b[0;31m'
const RESET_CONSOLE_COLOR = '\x1b[0m'

const ASSIGNEES = 'thypon'
const HOTWORDS = `password
cryptography
login
authentication
authorization
authn
authz
oauth
secure
insecure
safebrowsing
safe browsing
csp
url parse
urlparse
:disableDigestUpdates
pinDigest`

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

module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: getConfig } = await import(`${actionPath}/src/getConfig.js`)
  const { default: getProperties } = await import(`${actionPath}/src/getProperties.js`)

  // delete if empty string in inputs value
  Object.keys(inputs).forEach(key => inputs[key] === '' && delete inputs[key])

  const config = await getConfig({ owner: context.repo.owner, repo: context.repo.repo, path: '.github/security-action.json', debug, github })
  const properties = await getProperties({ owner: context.repo.owner, repo: context.repo.repo, debug, github, prefix: 'security_action_' })

  const options = Object.assign({
    enabled: 'true',
    baseline_scan_only: 'true',
    assignees: ASSIGNEES,
    hotwords: HOTWORDS,
    hotwords_enabled: 'false',
    codeowners_min_files: '50',
    codeowners_mode: 'groups',
    modelscan_enabled: 'all'
  }, config, properties, inputs)

  options.enabled = options.enabled === 'true'
  options.hotwords_enabled = options.hotwords_enabled === 'true'
  options.baseline_scan_only = options.baseline_scan_only === 'true'
  options.debug = options.debug ? (options.debug === 'true') : debug

  const debugLog = options.debug ? console.log : () => {}

  // Fork PRs run with a read-only GITHUB_TOKEN: every PR write (comments,
  // labels, assignees, review-comment cleanup) 403s with
  // "Resource not accessible by integration". guardWrite turns that into a
  // skip + warning instead of failing an otherwise-green run; comment
  // content is mirrored to the job summary at the call sites.
  const { guardWrite } = await import(`${actionPath}/src/githubWriteGuard.js`)

  // Sanitize the assignees input at the boundary. The raw value has been
  // observed containing an entire HTML message (a reply pasted into the
  // workflow input), which used to be split on whitespace into per-word
  // "logins" and fed verbatim to add-assignees → 404 (brave-experiments/
  // brave-bot PRs #20/#58/#59). Sanitizing once here means every consumer
  // (modelscan mentions, reviewdog ASSIGNEES env, slack cc, add-assignees)
  // sees validated logins only.
  const { sanitizeAssignees, filterExistingLogins, addAssigneesSafely } = await import(`${actionPath}/src/validateAssignees.js`)
  const loginCache = new Map()
  const warnDropped = dropped => core.warning(`assignees: dropped unusable logins: ${dropped.join(', ')}`)
  options.assignees = sanitizeAssignees(options.assignees, { onDropped: warnDropped }).join('\n')

  debugLog('Options: ', options)

  if (!options.enabled) { return }

  debugLog('Security Action enabled')
  // reviewdog-enabled-pr steps
  const reviewdogEnabledPr = options.baseline_scan_only && context.eventName === 'pull_request'
  debugLog(`Security Action enabled for PR: ${reviewdogEnabledPr}, baseline_scan_only: ${options.baseline_scan_only}, GITHUB_EVENT_NAME: ${context.eventName}, context.actor: ${context.actor}`)
  // reviewdog-enabled-full steps
  const reviewdogEnabledFull = !reviewdogEnabledPr && (!options.baseline_scan_only || context.eventName === 'workflow_dispatch')
  debugLog(`Security Action enabled for full: ${reviewdogEnabledFull}, baseline_scan_only: ${options.baseline_scan_only}, GITHUB_EVENT_NAME: ${context.eventName}`)
  // reviewdog-enabled steps
  if (!reviewdogEnabledPr && !reviewdogEnabledFull) { return }
  debugLog('Security Action enabled for reviewdog')

  // Fetch changed files early (PR runs) — the list decides whether the
  // heavyweight tensorflow dependency group is needed (uv sync below) and
  // is consumed by modelscan / codeowners later.
  let changedFiles = null
  if (reviewdogEnabledPr && context.actor !== 'dependabot[bot]') {
    const { default: pullRequestChangedFiles } = await import(`${actionPath}/src/pullRequestChangedFiles.js`)
    changedFiles = await pullRequestChangedFiles({ github, owner: context.repo.owner, name: context.repo.repo, prnumber: context.payload.pull_request.number })
    debugLog('Changed files:', changedFiles)

    // The PR files API lists paths as a diff against the base branch head,
    // but the runners consume the list against the checked-out merge
    // commit. Drop paths missing from the working tree (e.g. renamed on
    // the base branch after the pull request forked) or the scanners
    // crash opening them. The unfiltered list stays for codeowners and
    // modelscan, which reason about the PR rather than the working tree.
    const { default: filterExistingFiles } = await import(`${actionPath}/src/filterExistingFiles.js`)
    const existingFiles = filterExistingFiles(changedFiles, {
      onDropped: missing => debugLog('Changed files missing from the checkout:', missing)
    })

    // Write changed files to file
    fs.writeFileSync(`${actionPath}/assets/all_changed_files.txt`, existingFiles.join('\0'))
    debugLog('Wrote changed files to file')
  }

  // Sync python deps from the uv lockfile (uv installed via action.yml).
  // Creates ${actionPath}/.venv — reviewdog runners and the modelscan audit
  // script resolve python3/pip-audit from it via PATH / uv run.
  // modelscan deps (~20MB) and tensorflow (~685MB) are separate dependency
  // groups, synced only when the PR contains model files (see
  // src/modelscanDependencyGroups.js) or SEC_ACTION_MODELSCAN_HEAVY is set.
  const { default: modelscanDependencyGroups } = await import(`${actionPath}/src/modelscanDependencyGroups.js`)
  const depGroups = modelscanDependencyGroups({
    changedFiles: changedFiles || [],
    modelscanEnabled: options.modelscan_enabled
  })
  const groupArgs = depGroups.map(g => ` --group ${g}`).join('')
  debugLog(`modelscan dependency groups: ${depGroups.join(', ') || 'none'}`)
  // uv sync installs PR-controlled lockfiles (and runs build hooks for
  // sdists) — sandbox it: read-only workspace, writable venv + uv caches,
  // TLS-only egress (see scripts/with-sandbox.sh / README threat model).
  // Prebuilt image: when uv.lock still hashes to the image manifest
  // value, the baked cache is complete — sync offline.
  const { readImageManifest, lockHashMatches, commandAvailable } = await import(`${actionPath}/src/systemImage.js`)
  const offlineUv = lockHashMatches({
    fsx: fs,
    manifest: readImageManifest(fs),
    lockPath: `${actionPath}/uv.lock`,
    key: 'uv_lock_sha256'
  })
  debugLog(`uv sync offline: ${offlineUv}`)
  const { default: buildUvSyncCmd } = await import(`${actionPath}/src/uvSyncSandbox.js`)
  await runCommand(buildUvSyncCmd({
    actionPath,
    cwd: process.cwd(),
    home: os.homedir(),
    groupArgs,
    offline: offlineUv,
    // setup-uv exports these on runners; honor the overrides.
    uvCacheDir: process.env.UV_CACHE_DIR || `${os.homedir()}/.cache/uv`,
    uvPythonDir: process.env.UV_PYTHON_INSTALL_DIR || `${os.homedir()}/.local/share/uv`
  }), { shell: true })
  debugLog('Synced python dependencies (uv)')
  // xmllint for safesvg. Baked into the prebuilt image; plain runners
  // still install it via apt (see the update-first note below).
  if (commandAvailable('xmllint', { env: process.env, fsx: fs })) {
    debugLog('xmllint already available; skipping apt install')
  } else {
    // Disable man-db auto-update to speed up apt-get operations
    await runCommand('sudo rm -f /var/lib/man-db/auto-update || echo "Warning: Failed to disable man-db auto-update"', { shell: true })
    // Install xmllint for safesvg. Update first: the runner's stale apt
    // index routinely points at superseded point releases and every
    // mirror 404s; apt update refreshes it before the install attempt.
    // Acquire::Retries + network timeouts retry transient fetch failures
    // (packages.microsoft.com 403'd a whole run in PR #3087).
    const aptRetry = '-o Acquire::Retries=5 -o Acquire::http::Timeout=30 -o Acquire::https::Timeout=30'
    await runCommand(`sudo apt-get update -qq ${aptRetry} && sudo apt-get install -y ${aptRetry} libxml2-utils`, { shell: true })
    debugLog('Installed xmllint')
  }

  // debug step
  if (options.debug) {
    const env = {
      ...process.env,
      ASSIGNEES: options.assignees
    }
    await runCommand(`${actionPath}/assets/debug.sh`, { env })
    debugLog('Debug step completed')
  }

  // run-reviewdog-full step
  if (reviewdogEnabledFull) {
    const env = { ...process.env }
    delete env.GITHUB_BASE_REF
    env.PATH = `${actionPath}/.venv/bin:${process.env.PATH}`
    await runCommand(`${actionPath}/assets/reviewdog.sh`, { env })
    debugLog('Reviewdog full step completed')
  }

  if (reviewdogEnabledPr && context.actor !== 'dependabot[bot]') {
    // ═══════════════════════════════════════════════════════════════════════
    // MODELSCAN — binary model file security scanner
    //
    // Configured via `modelscan_enabled` (action input, .github/security-action.json
    // config, or security_action_modelscan_enabled repo property — merged into
    // options): 'all' (default) → every scanner;
    // 'pickle,numpy,pytorch' → lightweight only; 'false' / '' → disable entirely.
    //
    // Skipped entirely unless a changed file has a model suffix — the deps
    // would not be installed (see modelscanDependencyGroups above). If a
    // scanner is enabled but its dep is missing (e.g. tensorflow group not
    // synced), modelscan skips the file with a DependencyError — no crash.
    //
    // Posts file-level review comments via createReviewComment with
    // subject_type:'file' — reviewdog cannot handle binary files
    // (see brave/security-action#707).
    // ═══════════════════════════════════════════════════════════════════════
    const modelscanList = (options.modelscan_enabled || 'all').trim().toLowerCase()
    if (modelscanList && modelscanList !== 'false' && depGroups.includes('modelscan')) {
      const { default: modelscanPostComments } = await import(`${actionPath}/src/modelscanPostComments.js`)
      await modelscanPostComments({
        github,
        context,
        actionPath,
        assignees: options.assignees,
        debug: options.debug,
        enabledScanners: modelscanList,
        core
      })
    }

    // codeowners matching step
    const { default: matchCodeowners } = await import(`${actionPath}/src/matchCodeowners.js`)
    const { default: codeownersComment } = await import(`${actionPath}/src/steps/codeownersComment.js`)

    const codeownersMatch = matchCodeowners({
      changedFiles,
      basePath: process.cwd(),
      debug: options.debug
    })

    await codeownersComment({
      context,
      github,
      matchResult: codeownersMatch,
      debug: options.debug,
      minFiles: options.codeowners_min_files,
      mode: options.codeowners_mode,
      core
    })
    debugLog('Posted codeowners comment')

    // comments-before steps
    const { default: commentsNumber } = await import(`${actionPath}/src/steps/commentsNumber.js`)
    const { default: cleanupComments } = await import(`${actionPath}/src/steps/cleanupComments.js`)
    debugLog('Comments before:', await commentsNumber({ context, github }))

    const { number: commentsBefore } = await commentsNumber({ context, github })
    await guardWrite(core, 'cleanup outdated review comments', () =>
      cleanupComments({ context, github }))

    // unverified-commits steps
    const { default: unverifiedCommits } = await import(`${actionPath}/src/steps/unverifiedCommits.js`)

    // add unverified-commits label step
    try {
      const unverifiedCommitsSteps = await unverifiedCommits({ context, github })
      if (unverifiedCommitsSteps === 'UNVERIFIED-CHANGED') {
        await guardWrite(core, 'add unverified-commits label', () =>
          github.rest.issues.addLabels({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            labels: ['unverified-commits']
          }))
        debugLog('Added unverified-commits label')
      }
    } catch (e) {
      console.error('Unverified commits check failed:', e.message)
    }

    // run-reviewdog-pr step
    const env = {
      ...process.env,
      PATH: `${actionPath}/.venv/bin:${process.env.PATH}`,
      ASSIGNEES: options.assignees,
      REMOTE_RUNTIME: options.runtime,
      REVIEWDOG_GITHUB_API_TOKEN: options.github_token,
      SEC_ACTION_DEBUG: options.debug,
      PYPI_INDEX_URL: options.pip_audit_pypi_index_url,
      PYPI_INSECURE_HOSTS: options.pip_audit_pypi_insecure_hosts
    }
    await runCommand(`${actionPath}/assets/reviewdog.sh`, { env })
    debugLog('Reviewdog PR step completed')

    // comments-after step
    const { number: commentsAfter, categories } = await commentsNumber({ context, github })
    debugLog('Comments after:', commentsAfter)

    // assignees-after step
    const { default: assigneesAfter } = await import(`${actionPath}/src/steps/assigneesAfter.js`)
    const assigneesAfterVal = await assigneesAfter({ context, github, assignees: options.assignees })
    debugLog('Assignees after:', assigneesAfterVal)

    // assignee-removed-label step
    const { default: assigneeRemoved } = await import(`${actionPath}/src/steps/assigneeRemoved.js`)
    const assigneeRemovedLabel = await assigneeRemoved({ context, github, assignees: assigneesAfterVal })
    debugLog('Assignee removed:', assigneeRemovedLabel)

    // add description-contains-hotwords step
    const { default: hotwords } = await import(`${actionPath}/src/steps/hotwords.js`)
    const descriptionContainsHotwords = (context.actor !== 'renovate[bot]' && options.hotwords_enabled) ? await hotwords({ context, github, hotwords: options.hotwords, core }) : false
    debugLog('Description contains hotwords:', descriptionContainsHotwords)

    // add should-trigger label step
    const shouldTrigger = reviewdogEnabledPr && !assigneeRemovedLabel && ((commentsBefore < commentsAfter) || descriptionContainsHotwords)
    debugLog('Should trigger:', shouldTrigger)

    if (shouldTrigger) {
      if (categories.includes('security')) {
        // add label step
        await guardWrite(core, 'add needs-security-review label', () =>
          github.rest.issues.addLabels({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            labels: ['needs-security-review']
          }))
        debugLog('Added needs-security-review label')
      }
      // add assignees step — pre-check logins exist, then assign non-fatally:
      // assignment is auxiliary and must never fail the security job. A
      // nonexistent (404) or unauthorized (422) login only produces a
      // warning; on fork PRs guardWrite turns the 403 from the read-only
      // token into a skip, mirroring the other PR writes.
      const assigneeCandidates = sanitizeAssignees(assigneesAfterVal, { onDropped: warnDropped })
      const existingAssignees = assigneeCandidates.length > 0
        ? await filterExistingLogins(github, assigneeCandidates, { cache: loginCache, onDropped: warnDropped })
        : []
      if (existingAssignees.length > 0) {
        await guardWrite(core, 'add assignees', () =>
          addAssigneesSafely(github, {
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            assignees: existingAssignees
          }, { warn: msg => core.warning(msg) }))
        debugLog('Added assignees')
      } else {
        debugLog('No valid assignees to add')
      }
    }

    const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)

    const channel = options.slack_channel || '#secops-hotspots'
    const repoName = `${context.repo.owner}/${context.repo.repo}`

    const message = `Repository: [${repoName}](https://github.com/${repoName})\npull-request: ${context.payload.pull_request.html_url}\nFindings: ${commentsAfter}`

    let githubToSlack = {}
    try {
      githubToSlack = JSON.parse(options.gh_to_slack_user_map)
    } catch (e) {
      console.log('GH_TO_SLACK_USER_MAP is not valid JSON')
    }

    // assignees-slack step
    const assignees = assigneesAfterVal.toLowerCase().split(/\s+/).map(e => e.trim()).filter(Boolean)
    const slackAssignees = assignees.map(m => githubToSlack[m] ? githubToSlack[m] : `@${m}`).join(' ')
    core.setSecret(slackAssignees)
    debugLog('Slack assignees:', slackAssignees)

    // actor-slack step
    const lowerActor = context.actor.toLowerCase()
    const actor = githubToSlack[lowerActor] ? githubToSlack[lowerActor] : `@${context.actor}`
    core.setSecret(actor)

    // if actor starts with hashtag, return eagerly
    if (actor.startsWith('#')) {
      debugLog('Actor starts with hashtag, exiting eagerly!')
      return
    }

    if (fs.existsSync('reviewdog.fail.log')) {
      // print reviewdog.fail.log to the console
      const log = fs.readFileSync('reviewdog.fail.log', 'UTF-8').replaceAll(/^/g, CONSOLE_BLUE)
      console.log(`${CONSOLE_RED}This action encountered an error while reporting the following findings via the Github API:`)
      console.log(log)
      console.log(`${CONSOLE_RED}The failure of this action should not prevent you from merging your PR. Please report this failure to the maintainers of https://github.com/brave/security-action ${RESET_CONSOLE_COLOR}`)
      debugLog('Error log printed to console')

      if (options.slack_token) {
        // reviewdog-fail-log-head step
        const reviewdogFailLogHead = '\n' + fs.readFileSync('reviewdog.fail.log', 'UTF-8').split('\n').slice(0, 4).join('\n')
        debugLog('Reviewdog fail log head:', reviewdogFailLogHead)

        // send error slack message, if there is any error
        await sendSlackMessage({
          token: options.slack_token,
          text: `[error] ${actor} action failed, plz take a look. /cc ${slackAssignees} ${reviewdogFailLogHead}`,
          message,
          channel,
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

    if (options.slack_token && shouldTrigger) {
      // Send slack message, if there are any findings
      await sendSlackMessage({
        token: options.slack_token,
        text: `${actor} pushed commits. /cc ${slackAssignees}`,
        message,
        channel,
        color: 'green',
        username: 'security-action'
      })
      debugLog('Comments after:', commentsAfter)
    }
  } else if (context.actor === 'dependabot[bot]') {
    // if the actor is dependabot[bot], add security label to PR, and nothing more
    await guardWrite(core, 'add dependabot security labels', () =>
      github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        labels: ['security', 'P2']
      }))
    debugLog('Added security label to PR')
  }
}
