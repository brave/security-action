// Reconciliation: find nudge messages for repos that
// no longer have any qualifying open Dependabot alerts
// (e.g. fixed manually, auto-closed, or dismissed in
// a prior run) and delete the stale Slack messages.

import {
  DEFAULT_SKIP_HOTWORDS,
  nudgeSeverityForWeek,
  severityKeysAbove
} from './dependabotConstants.js'

// Fetch a repo's qualifying open alerts.
// Returns an array (empty means the nudge message is
// stale), or null when the check could not be completed.
async function qualifyingAlerts (
  github, repoFullName, severityKeys, skipHotwords, debug
) {
  const [repoOrg, repoName] = repoFullName.split('/')
  if (!repoOrg || !repoName) return null

  try {
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
        severity: severityKeys
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

    if (qualifying.length === 0 && debug) {
      console.log(
        `reconcile: ${repoFullName} has 0` +
        ' qualifying alerts, marking stale'
      )
    }

    return qualifying
  } catch (err) {
    // On any error (rate limit, transient 5xx,
    // permissions, etc.) keep the message and retry
    // on the next scheduled run.
    console.log(
      'reconcile: error checking ' +
      `${repoFullName}: ${err.message}` +
      ' — keeping message until next run'
    )
    return null
  }
}

// Reconcile nudge messages: find repos whose nudge
// messages are stale and delete them.
//
// @param {object} opts
// @param {object} opts.github          - Octokit instance
// @param {string} opts.slackToken      - Slack bot token
// @param {string} opts.channel         - Slack channel
// @param {string[]} opts.dismissedRepos - Repos already
//   cleaned up by the dismiss step (skip these)
// @param {boolean} [opts.debug]
// @param {string[]} [opts.skipHotwords]
// @param {Function} opts.listSlackMessageRepos
// @param {Function} opts.deleteSlackMessages
// @param {Function} [opts.refreshNudgeThread] - Called as
//   ({repoFullName, alerts, debug, silent: true}) for repos
//   that still have alerts, to sync the thread with what is
//   left. Silent: between weekly nudges the thread may be
//   corrected but never grows, so the daily run stays
//   invisible to the maintainers following the thread.
// @param {Date} [opts.now] - Injected clock for tests;
//   defaults to the current time
// @returns {Promise<string[]>} List of stale repo names
export default async function reconcileNudgeMessages ({
  github,
  slackToken,
  channel,
  dismissedRepos = [],
  debug = false,
  skipHotwords = DEFAULT_SKIP_HOTWORDS,
  listSlackMessageRepos,
  deleteSlackMessages,
  refreshNudgeThread = null,
  now = new Date()
}) {
  debug = debug === 'true' || debug === true

  const nudgeUsername = 'dependabot'

  // Match the threshold of the nudge that produced the threads
  // being reconciled: derive it from this ISO week's Monday, not
  // from today, so a run just past a month boundary never
  // qualifies more alerts than the week's nudge posted.
  const minlevel = nudgeSeverityForWeek(now)
  const severityKeys = severityKeysAbove(minlevel)

  const nudgedRepos = await listSlackMessageRepos({
    token: slackToken,
    channel,
    username: nudgeUsername,
    debug
  })

  // Exclude repos we already cleaned up.
  const toReconcile = nudgedRepos.filter(
    r => !dismissedRepos.includes(r)
  )

  const staleRepos = []

  for (const repoFullName of toReconcile) {
    const alerts = await qualifyingAlerts(
      github, repoFullName, severityKeys,
      skipHotwords, debug
    )

    if (alerts && alerts.length === 0) {
      staleRepos.push(repoFullName)
    } else if (alerts && refreshNudgeThread) {
      // Alerts remain, but some may have been dismissed or
      // fixed: rewrite the thread so the listed alerts and
      // the count on the parent match reality.
      try {
        await refreshNudgeThread({
          repoFullName, alerts, debug, silent: true
        })
      } catch (err) {
        console.error(
          `reconcile: failed to refresh ${repoFullName}: ` +
          err.message
        )
      }
    }

    // Delay between API calls to avoid secondary
    // rate limits when checking many repos.
    if (toReconcile.length > 1) {
      await new Promise(resolve =>
        setTimeout(resolve, 1000)
      )
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
      token: slackToken,
      channel,
      username: nudgeUsername,
      repos: staleRepos
    })
  }

  return staleRepos
}
