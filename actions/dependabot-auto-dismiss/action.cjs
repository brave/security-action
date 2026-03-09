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

  const org = context.repo.owner
  const dismissConfig =
    `${actionPath}/actions/dependabot-auto-dismiss` +
    '/dismiss.txt'

  const { message, dismissedRepos } =
    await dependabotDismiss({
      debug, org, github,
      dependabotDismissConfig: dismissConfig
    })

  // Remove stale nudge messages for repos that had
  // alerts dismissed in this run.
  if (dismissedRepos.length > 0) {
    await deleteSlackMessages({
      debug,
      token: inputs.slack_token,
      channel: '#secops-hotspots',
      username: 'dependabot',
      repos: dismissedRepos
    })
  }

  // Reconciliation: find nudge messages for repos
  // that no longer have any qualifying open alerts
  // (e.g. fixed manually, auto-closed, or dismissed
  // in a prior run).
  const nudgeChannel = '#secops-hotspots'
  const nudgeUsername = 'dependabot'
  const skipHotwords = [
    'dos', 'denial of service', 'redos',
    'denial-of-service', 'memory explosion',
    'inefficient regular expression',
    'regular expression complexity'
  ]

  // Use the same date-based severity logic that
  // dependabotNudge uses: 'medium' on the first
  // Monday of the month, 'high' otherwise.
  const today = new Date()
  const severityFilter = today.getDate() <= 7
    ? ['medium', 'high', 'critical']
    : ['high', 'critical']

  const nudgedRepos = await listSlackMessageRepos({
    token: inputs.slack_token,
    channel: nudgeChannel,
    username: nudgeUsername,
    debug
  })

  // Exclude repos we already cleaned up above.
  const toReconcile = nudgedRepos.filter(
    r => !dismissedRepos.includes(r)
  )

  const staleRepos = []

  for (const repoFullName of toReconcile) {
    const [repoOrg, repoName] =
      repoFullName.split('/')
    if (!repoOrg || !repoName) continue

    try {
      // Fetch open dependabot alerts with the same
      // severity filter that dependabotNudge uses.
      const alerts = await github.paginate(
        'GET /repos/{owner}/{repo}/dependabot/alerts',
        {
          owner: repoOrg,
          repo: repoName,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          },
          sort: 'updated',
          state: 'open',
          severity: severityFilter
        }
      )

      // Apply the same post-filters as nudge:
      // - skip hotword matches
      // - require a patched version
      const qualifying = alerts.filter(a => {
        const summary =
          a.security_advisory.summary.toLowerCase()
        if (skipHotwords.some(h =>
          summary.includes(h)
        )) {
          return false
        }
        const patched =
          a.security_vulnerability
            ?.first_patched_version?.identifier
        return !!patched
      })

      if (qualifying.length === 0) {
        staleRepos.push(repoFullName)
        if (debug) {
          console.log(
            `reconcile: ${repoFullName} has 0` +
            ' qualifying alerts, marking stale'
          )
        }
      }
    } catch (err) {
      // Repo may have been archived/deleted/no
      // access. Treat as stale so the nudge
      // message is removed.
      if (debug) {
        console.log(
          `reconcile: error checking ` +
          `${repoFullName}: ${err.message}`
        )
      }
      staleRepos.push(repoFullName)
    }
  }

  if (staleRepos.length > 0) {
    if (debug) {
      console.log(
        'reconcile: cleaning up nudge messages' +
        ` for ${staleRepos.length} stale ` +
        `repo(s): ${staleRepos.join(', ')}`
      )
    }
    await deleteSlackMessages({
      debug,
      token: inputs.slack_token,
      channel: nudgeChannel,
      username: nudgeUsername,
      repos: staleRepos
    })
  }

  if (message.length > 0) {
    await sendSlackMessage({
      debug,
      username: 'dependabot-auto-dismiss',
      message,
      channel: '#secops-hotspots',
      token: inputs.slack_token
    })
  }
}
