module.exports = async ({ github, context, inputs, actionPath, core, debug = false }) => {
  const { default: sendSlackMessage } = await import(`${actionPath}/src/sendSlackMessage.js`)
  const { default: dependabotNudge } = await import(`${actionPath}/src/dependabotNudge.js`)

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

  const messages = await dependabotNudge({ debug, org: context.repo.owner, github, minlevel, githubToSlack })

  for (const message of messages) {
    try {
      await sendSlackMessage({ debug, username: 'dependabot', message, channel: '#secops-hotspots', token: inputs.slack_token })
    } catch (error) {
      if (debug) { console.log(error) }
    }
  }
}
