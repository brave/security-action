module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)
  const { default: dependabotNudge } = await import(`${actionPath}/src/dependabotNudge.js`)
  const { default: isoWeekId } = await import(`${actionPath}/src/isoWeekId.js`)
  const { findChannelId, fetchMessages } = await import(`${actionPath}/src/slackUtils.js`)
  const { WebClient } = await import('@slack/web-api')

  let githubToSlack = {}
  try {
    githubToSlack = JSON.parse(inputs.gh_to_slack_user_map)
  } catch (e) {
    if (debug) console.log('GH_TO_SLACK_USER_MAP is not valid JSON')
  }

  // set minlevel to 'medium' if it's the first Monday of the month, otherwise stick to high or critical issues
  let minlevel = 'medium'
  const today = new Date()
  if (today.getDate() > 7) {
    if (debug) { console.log('Not the first Monday of the month!') }
    minlevel = 'high'
  }

  const messages = await dependabotNudge({ debug, org: context.repo.owner, github, minlevel, githubToSlack, actionPath })

  // Nothing to nudge about: skip creating a thread entirely.
  if (messages.length === 0) {
    if (debug) { console.log('no dependabot alerts to nudge about; skipping thread') }
    return
  }

  const channel = inputs.slack_channel || '#secops-hotspots'
  const token = inputs.slack_token
  const org = context.repo.owner
  const weekId = isoWeekId(today)

  const parentEventType = 'dependabot-nudge-weekly-parent'
  const parentPayload = { org, weekId }

  const web = new WebClient(token)
  const channelId = await findChannelId(web, channel)

  const recent = await fetchMessages(web, channelId, 7)
  const parent = recent
    .filter(m =>
      m.metadata?.event_type === parentEventType &&
      m.metadata?.event_payload?.org === org &&
      m.metadata?.event_payload?.weekId === weekId)
    .sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts))[0]

  let parentTs = parent?.ts

  if (!parentTs) {
    if (debug) { console.log(`creating new weekly parent thread for ${org} ${weekId}`) }
    const parentResult = await sendSlackMessage({
      debug,
      username: 'dependabot',
      text: `Weekly Dependabot Nudge — ${weekId}`,
      channel,
      token,
      eventType: parentEventType,
      eventPayload: parentPayload
    })
    parentTs = parentResult?.ts
  } else {
    if (debug) { console.log(`reusing weekly parent thread ${parentTs} for ${org} ${weekId}`) }
  }

  if (!parentTs) {
    console.error('failed to obtain parent thread ts; aborting replies')
    return
  }

  for (const { repo, message } of messages) {
    try {
      await sendSlackMessage({
        debug,
        username: 'dependabot',
        message,
        channel,
        token,
        threadTs: parentTs,
        eventPayload: { repo }
      })
    } catch (error) {
      if (debug) { console.log(error) }
    }
  }
}
