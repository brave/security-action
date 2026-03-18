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

  const org = context.repo.owner
  const channel = '#secops-hotspots'
  const dismissConfig =
    `${actionPath}/actions/dependabot-auto-dismiss` +
    '/dismiss.txt'

  const { message, dismissedRepos } =
    await dependabotDismiss({
      debug,
      org,
      github,
      dependabotDismissConfig: dismissConfig
    })

  // Remove stale nudge messages for repos that had
  // alerts dismissed in this run.
  if (dismissedRepos.length > 0) {
    await deleteSlackMessages({
      debug,
      token: inputs.slack_token,
      channel,
      username: 'dependabot',
      repos: dismissedRepos
    })
  }

  // Reconciliation: find nudge messages for repos
  // that no longer have any qualifying open alerts.
  await reconcileNudgeMessages({
    github,
    slackToken: inputs.slack_token,
    channel,
    dismissedRepos,
    debug,
    listSlackMessageRepos,
    deleteSlackMessages
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
