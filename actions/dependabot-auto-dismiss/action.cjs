module.exports = async ({
  github, context, inputs, actionPath, core,
  debug = false
}) => {
  const { default: sendSlackMessage } =
    await import(
      `${actionPath}/src/sendSlackMessage.js`
    )
  const {
    default: deleteSlackMessages,
    listSlackMessageRepos
  } = await import(
    `${actionPath}/src/deleteSlackMessages.js`
  )
  const { default: dependabotDismiss } =
    await import(
      `${actionPath}/src/dependabotDismiss.js`
    )
  const { default: reconcileNudgeMessages } =
    await import(
      `${actionPath}/src/reconcileNudgeMessages.js`
    )
  const { default: refreshNudgeThread } =
    await import(
      `${actionPath}/src/refreshNudgeThread.js`
    )
  const { prepareSlackContext } =
    await import(`${actionPath}/src/slackUtils.js`)

  const org = context.repo.owner
  const channel = '#secops-hotspots'
  const dismissConfig =
    `${actionPath}/actions/dependabot-auto-dismiss` +
    '/dismiss.txt'

  const { message } =
    await dependabotDismiss({
      debug,
      org,
      github,
      dependabotDismissConfig: dismissConfig
    })

  // Reconciliation, including the repos touched by the
  // dismissal above: threads for repos with no qualifying
  // alerts left are deleted, and threads that still have
  // alerts are rewritten so the dismissed ones disappear
  // and the count on the parent stays truthful.
  const { web, channelId, messages: slackMessages } =
    await prepareSlackContext(inputs.slack_token, channel, 8)

  await reconcileNudgeMessages({
    github,
    slackToken: inputs.slack_token,
    channel,
    debug,
    listSlackMessageRepos,
    deleteSlackMessages,
    refreshNudgeThread: ({ repoFullName, alerts }) =>
      refreshNudgeThread({
        web,
        channelId,
        messages: slackMessages,
        repoFullName,
        alerts,
        debug
      })
  })

  if (message.length > 0) {
    await sendSlackMessage({
      debug,
      username: 'dependabot-auto-dismiss',
      message,
      channel,
      token: inputs.slack_token
    })
  }
}
