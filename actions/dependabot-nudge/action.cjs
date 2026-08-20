module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: dependabotNudge } = await import(`${actionPath}/src/dependabotNudge.js`)
  const { default: isoWeekId } = await import(`${actionPath}/src/isoWeekId.js`)
  const { default: postNudgeThreads } = await import(`${actionPath}/src/postNudgeThreads.js`)
  const { prepareSlackContext } = await import(`${actionPath}/src/slackUtils.js`)

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

  const nudges = await dependabotNudge({ debug, org: context.repo.owner, github, minlevel, githubToSlack, actionPath })

  // Nothing to nudge about: skip creating threads entirely.
  if (nudges.length === 0) {
    if (debug) { console.log('no dependabot alerts to nudge about; skipping threads') }
    return
  }

  const channel = inputs.slack_channel || '#secops-hotspots'

  // One Slack client, one channel lookup, one history fetch
  // for the whole run; the thread posting itself lives in
  // src/postNudgeThreads.js where it is unit-testable.
  const { web, channelId, messages } = await prepareSlackContext(inputs.slack_token, channel, 7)

  await postNudgeThreads({
    web,
    channelId,
    org: context.repo.owner,
    messages,
    nudges,
    weekId: isoWeekId(today),
    debug
  })
}
