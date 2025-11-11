const path = require('path')

async function findExistingComment (github, owner, repo, issueNumber) {
  const comments = await github.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber
  })

  return comments.data.find(comment =>
    comment.user.login === 'github-actions[bot]' &&
    comment.body.includes('## Opengrep Findings')
  )
}

module.exports = async ({ github, context, inputs, actionPath, core }) => {
  console.log('Starting Opengrep scan...')

  const targetRepo = inputs.target_repo || null
  const targetPath = inputs.target_path || null
  const baseRef = context.payload.pull_request?.base?.ref || inputs.base_ref || 'main'

  // Import the shared opengrep compare logic
  const opengrepModule = await import(path.join(actionPath, 'src/opengrepCompare.js'))
  const opengrepCompare = opengrepModule.default
  const generateMarkdownSummary = opengrepModule.generateMarkdownSummary

  // Run the opengrep scan
  const options = {
    'target-repo': targetRepo,
    'target-path': targetPath,
    'base-ref': baseRef
  }

  let result
  try {
    result = await opengrepCompare(options)
  } catch (error) {
    console.error('Opengrep scan failed:', error)
    core.setFailed('Opengrep scan failed: ' + error.message)
    return
  }

  const totalFindings = result.total
  const findings = result.findings || {}
  const ruleStats = result.summary || []
  const delta = result.delta
  const percentageIncrease = result.percentageIncrease || 0
  const baseTotal = result.baseTotal
  const noChanges = result.noChanges || false

  console.log(`Total findings: ${totalFindings}`)

  // If no rule changes, skip posting comment
  if (noChanges) {
    console.log('No rule files changed, skipping comment')
    core.setOutput('new_findings_count', 0)
    core.setOutput('has_new_findings', 'false')
    core.setOutput('percentage_increase', 0)
    core.setOutput('base_findings', 0)
    core.setOutput('total_findings', 0)
    return
  }

  // For comparison mode, use new findings count instead of total
  const newFindingsCount = delta
    ? Object.values(delta.newFindings).flat().length
    : totalFindings

  // Set outputs
  core.setOutput('new_findings_count', newFindingsCount)
  core.setOutput('has_new_findings', newFindingsCount > 0 ? 'true' : 'false')
  core.setOutput('percentage_increase', percentageIncrease)
  core.setOutput('base_findings', baseTotal || 0)
  core.setOutput('total_findings', totalFindings)

  // Generate markdown summary
  const targetRepoBranch = result.targetRepoDefaultBranch
  const markdown = generateMarkdownSummary(findings, ruleStats, delta, percentageIncrease, baseTotal, targetRepo, targetRepoBranch)

  // Post comment if this is a PR
  if (context.eventName === 'pull_request' && context.payload.pull_request) {
    const { owner, repo } = context.repo
    const issueNumber = context.payload.pull_request.number

    // Find and delete existing comment
    const existingComment = await findExistingComment(github, owner, repo, issueNumber)
    if (existingComment) {
      console.log(`Deleting existing comment: ${existingComment.id}`)
      await github.rest.issues.deleteComment({
        owner,
        repo,
        comment_id: existingComment.id
      })
    }

    // Only post if there are findings
    if (totalFindings > 0) {
      console.log('Posting comment...')
      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: markdown
      })
    } else {
      console.log('No findings, skipping comment')
    }
  }

  // Write summary to step summary
  await core.summary
    .addRaw(markdown)
    .write()

  console.log('Opengrep scan complete!')
}
