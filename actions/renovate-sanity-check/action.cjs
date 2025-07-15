module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  console.log(`${actionPath}/src/renovateSanityCheck.js`)
  const { default: renovateSanityCheck } = await import(`${actionPath}/src/renovateSanityCheck.js`)
  const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)

  const message = await renovateSanityCheck({
    org: context.repo.owner,
    github,
    debug
  })

  if (message && message.length > 0) { await sendSlackMessage({ debug, username: 'renovate-sanity-check', message, color: 'yellow', channel: '#secops-hotspots', token: inputs.slack_token }) }
}
