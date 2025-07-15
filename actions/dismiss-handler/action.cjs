module.exports = async function ({ github, context, inputs, actionPath, core, debug }) {
  try {
    // Only process issue comments on PRs
    if (context.eventName !== 'issue_comment') {
      console.log('Event is not issue_comment, skipping dismiss handler')
      core.setOutput('dismissed', 'false')
      return
    }

    // Only process comments on pull requests
    if (!context.payload.issue.pull_request) {
      console.log('Comment is not on a PR, skipping dismiss handler')
      core.setOutput('dismissed', 'false')
      return
    }

    const comment = context.payload.comment
    const commentBody = comment.body.trim()
    const commentAuthor = comment.user.login
    const prNumber = context.payload.issue.number
    const repoOwner = context.payload.repository.owner.login
    const repoName = context.payload.repository.name

    if (debug) {
      console.log(`Processing comment by ${commentAuthor} on PR #${prNumber}`)
      console.log(`Comment body: "${commentBody}"`)
    }

    // Check if comment contains /dismiss command
    if (!commentBody.toLowerCase().includes('/dismiss')) {
      console.log('Comment does not contain /dismiss command, skipping')
      core.setOutput('dismissed', 'false')
      return
    }

    // Get PR information
    const { data: pr } = await github.rest.pulls.get({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber
    })

    // Check if the comment author is an assignee of the PR
    const assignees = pr.assignees.map(assignee => assignee.login)
    if (!assignees.includes(commentAuthor)) {
      console.log(`Comment author ${commentAuthor} is not an assignee, ignoring dismiss command`)
      core.setOutput('dismissed', 'false')
      return
    }

    console.log(`Processing dismiss command from assignee ${commentAuthor} on PR #${prNumber}`)

    // Check if already dismissed by looking for existing dismissal comments
    const { data: comments } = await github.rest.issues.listComments({
      owner: repoOwner,
      repo: repoName,
      issue_number: prNumber
    })

    const existingDismissal = comments.find(comment =>
      comment.user.login === 'github-actions[bot]' &&
      comment.body.includes(`✅ Security alerts dismissed by @${commentAuthor}`)
    )

    if (existingDismissal) {
      console.log(`PR #${prNumber} already dismissed by ${commentAuthor}`)
      core.setOutput('dismissed', 'false')
      return
    }

    // Add a comment to confirm dismissal
    await github.rest.issues.createComment({
      owner: repoOwner,
      repo: repoName,
      issue_number: prNumber,
      body: `✅ Security alerts dismissed by @${commentAuthor}. No further notifications will be sent for this PR until new security findings are detected.`
    })

    // Reply to existing Slack thread if configured
    if (inputs.slack_token) {
      try {
        const replyToSlackThread = require(actionPath + 'src/replyToSlackThread.js').default

        let userMap = {}
        if (inputs.gh_to_slack_user_map) {
          userMap = JSON.parse(inputs.gh_to_slack_user_map)
        }

        const slackUser = userMap[commentAuthor] || commentAuthor
        const replyText = `🔕 Dismissed by ${slackUser} - no further notifications will be sent until new security findings are detected.`

        const result = await replyToSlackThread({
          token: inputs.slack_token,
          channel: '#secops-hotspots',
          prNumber,
          repoName,
          replyText,
          debug
        })

        if (result) {
          console.log('Successfully replied to existing Slack thread')
        } else {
          console.log('No existing Slack thread found to reply to')
        }
      } catch (error) {
        console.error('Failed to reply to Slack thread:', error.message)
      }
    }

    console.log(`Successfully processed dismiss command from ${commentAuthor} on PR #${prNumber}`)
    core.setOutput('dismissed', 'true')
  } catch (error) {
    console.error('Error in dismiss handler:', error)
    core.setFailed(error.message)
  }
}
