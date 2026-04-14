// Reconciliation: find nudge messages for repos that
// no longer have any qualifying open Dependabot alerts
// (e.g. fixed manually, auto-closed, or dismissed in
// a prior run) and delete the stale Slack messages.

import {
  DEFAULT_SKIP_HOTWORDS,
  nudgeSeverityForToday,
  severityKeysAbove
} from './dependabotConstants.js'

// Check a single repo for qualifying open alerts.
// Returns true if the repo has zero qualifying alerts
// (i.e. its nudge message is stale).
async function isRepoStale (
  github, repoFullName, severityKeys, skipHotwords, debug
) {
  const [repoOrg, repoName] = repoFullName.split('/')
  if (!repoOrg || !repoName) return false

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

    if (qualifying.length === 0) {
      if (debug) {
        console.log(
          `reconcile: ${repoFullName} has 0` +
          ' qualifying alerts, marking stale'
        )
      }
      return true
    }
    return false
  } catch (err) {
    // On any error (rate limit, transient 5xx,
    // permissions, etc.) keep the message and retry
    // on the next scheduled run.
    console.log(
      'reconcile: error checking ' +
      `${repoFullName}: ${err.message}` +
      ' — keeping message until next run'
    )
    return false
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
// @returns {Promise<string[]>} List of stale repo names
export default async function reconcileNudgeMessages ({
  github,
  slackToken,
  channel,
  dismissedRepos = [],
  debug = false,
  skipHotwords = DEFAULT_SKIP_HOTWORDS,
  listSlackMessageRepos,
  deleteSlackMessages
}) {
  debug = debug === 'true' || debug === true

  const nudgeUsername = 'dependabot'

  const minlevel = nudgeSeverityForToday()
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
    const stale = await isRepoStale(
      github, repoFullName, severityKeys,
      skipHotwords, debug
    )
    if (stale) staleRepos.push(repoFullName)

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
