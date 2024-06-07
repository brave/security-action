module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)
  const { default: dependabotDismiss } = await import(`${actionPath}/src/dependabotDismiss.js`)
  const message = await dependabotDismiss({ debug, org: context.repo.owner, github, dependabotDismissConfig: `${actionPath}/actions/dependabot-auto-dismiss/dismiss.txt` })
  if (message.length > 0) { await sendSlackMessage({ debug, username: 'dependabot-auto-dismiss', message, channel: '#secops-hotspots', token: inputs.slack_token }) }
}
