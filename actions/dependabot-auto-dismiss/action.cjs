module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)
  const { default: deleteSlackMessages } = await import(`${actionPath}/src/deleteSlackMessages.js`)
  const { default: dependabotDismiss } = await import(`${actionPath}/src/dependabotDismiss.js`)
  const { message, dismissedRepos } = await dependabotDismiss({ debug, org: context.repo.owner, github, dependabotDismissConfig: `${actionPath}/actions/dependabot-auto-dismiss/dismiss.txt` })

  // Remove stale dependabot-nudge Slack messages for repos whose alerts were dismissed
  if (dismissedRepos.length > 0) {
    await deleteSlackMessages({
      debug,
      token: inputs.slack_token,
      channel: '#secops-hotspots',
      username: 'dependabot',
      repos: dismissedRepos
    })
  }

  if (message.length > 0) { await sendSlackMessage({ debug, username: 'dependabot-auto-dismiss', message, channel: '#secops-hotspots', token: inputs.slack_token }) }
}
