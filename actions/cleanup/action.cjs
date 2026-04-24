const ASSIGNEES = `thypon
kdenhartog`

module.exports = async ({
  github, context, inputs, actionPath, core,
  debug = false
}) => {
  const debugLog = (...args) => {
    if (debug) console.log(...args)
  }

  const channel = inputs.channel || '#secops-hotspots'
  const assignees = (inputs.assignees || ASSIGNEES)
    .split('\n')
    .map(a => a.trim())
    .filter(Boolean)

  const { default: cleanupMessages } =
    await import(
      `${actionPath}/src/cleanupSecurityActionMessages.js`
    )

  const cleaned = await cleanupMessages({
    token: inputs.slack_token,
    github,
    channel,
    debug,
    defaultAssignees: assignees
  })

  debugLog('Cleaned up stale messages:', cleaned)

  if (cleaned) {
    core.setOutput('cleaned', JSON.stringify(cleaned))
  }
}
