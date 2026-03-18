// Cleanup stale security-action Slack messages from
// #secops-hotspots. A message is deleted if ANY of:
//
// Signal A: checkmark reaction from a /cc'd person
// Signal B: thumbsup from a /cc'd person
// Signal C: needs-security-review label removed by
//           a security assignee on the linked PR
// Signal D: all github-actions review threads on the
//           linked PR are resolved by a security
//           assignee

import { findChannelId, fetchMessages } from './slackUtils.js'

const CHECKMARK_REACTIONS = [
  'white_check_mark',
  'heavy_check_mark',
  'ballot_box_with_check'
]

const THUMBSUP_REACTIONS = ['thumbsup', '+1']

const SECURITY_ACTION_USERNAME = 'security-action'

// Parse /cc <@U1234> <@U5678> from Slack message text.
// Returns an array of Slack user IDs.
export function parseCcUserIds (text) {
  if (!text) return []
  const ccIdx = text.indexOf('/cc ')
  if (ccIdx === -1) return []
  const after = text.slice(ccIdx + 4)
  const ids = []
  for (const m of after.matchAll(/<@(\w+)>/g)) {
    ids.push(m[1])
  }
  return ids
}

// Extract the PR URL from the Slack message blocks.
// The message body contains "pull-request: <url>".
export function extractPrUrl (msg) {
  const sources = [
    msg.text || '',
    ...(msg.blocks || []).map(
      b => b.text?.text || ''
    ),
    ...(msg.attachments || []).flatMap(
      a => (a.blocks || []).map(
        b => b.text?.text || ''
      )
    )
  ]

  for (const src of sources) {
    const match = src.match(
      /pull-request:\s*(https:\/\/github\.com\/[^\s>]+)/
    )
    if (match) return match[1]
  }
  return null
}

// Parse owner, repo, number from a GitHub PR URL.
export function parsePrUrl (url) {
  if (!url) return null
  const match = url.match(
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  )
  if (!match) return null
  return {
    owner: match[1],
    repo: match[2],
    number: parseInt(match[3], 10)
  }
}

// Query review threads for a PR, including
// isResolved and resolvedBy fields.
const REVIEW_THREADS_QUERY = `
  query(
    $owner: String!,
    $name: String!,
    $prnumber: Int!
  ) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $prnumber) {
        reviewThreads(last: 100) {
          nodes {
            isResolved
            resolvedBy { login }
            comments(first: 1) {
              totalCount
              nodes {
                author { login }
                body
              }
            }
          }
        }
      }
    }
  }`

// Query timeline for UNLABELED_EVENT items.
const UNLABELED_QUERY = `
  query(
    $owner: String!,
    $name: String!,
    $prnumber: Int!
  ) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $prnumber) {
        timelineItems(
          last: 100,
          itemTypes: UNLABELED_EVENT
        ) {
          nodes {
            ... on UnlabeledEvent {
              label { name }
              actor { login }
            }
          }
        }
      }
    }
  }`

// Compute assignees from review thread Cc patterns,
// mirroring the logic in assigneesAfter.js.
export function extractAssigneesFromThreads (
  threads, defaultAssignees
) {
  const found = [
    ...new Set(
      threads.nodes
        .filter(t =>
          t.comments.nodes[0]?.author?.login ===
            'github-actions' &&
          t.comments.nodes[0]?.body
            ?.includes('<br>Cc ')
        )
        .map(t =>
          t.comments.nodes[0].body
            .replace(/\n<!--(.*) -->\n/, '')
            .replace(/.*<br>Cc(.*)/, '$1')
            .replaceAll('@', '')
            .trim()
            .split(' ')
        )
        .flat()
    )
  ]

  if (found.length > 0) return found
  return defaultAssignees
}

// Check Signal C: needs-security-review label
// removed by an assignee.
async function checkLabelRemoved (
  github, pr, assignees
) {
  const result = await github.graphql(
    UNLABELED_QUERY,
    {
      owner: pr.owner,
      name: pr.repo,
      prnumber: pr.number
    }
  )

  const items =
    result.repository.pullRequest.timelineItems
  return items.nodes.some(
    item =>
      item.label?.name === 'needs-security-review' &&
      assignees.some(
        a => item.actor?.login?.toLowerCase() ===
          a.toLowerCase()
      )
  )
}

// Check Signal D: all github-actions review threads
// with <br>Cc are resolved by a security assignee.
export function checkAllThreadsResolved (threads, assignees) {
  const securityThreads = threads.nodes.filter(
    t =>
      t.comments.nodes[0]?.author?.login ===
        'github-actions' &&
      t.comments.nodes[0]?.body
        ?.includes('<br>Cc ')
  )

  if (securityThreads.length === 0) return false

  return securityThreads.every(t => {
    if (!t.isResolved) return false
    const resolver =
      t.resolvedBy?.login?.toLowerCase()
    return assignees.some(
      a => a.toLowerCase() === resolver
    )
  })
}

// Main cleanup function.
//
// @param {object} opts
// @param {string} opts.token        - Slack bot token
// @param {object} opts.github       - Octokit instance
// @param {string} opts.channel      - Slack channel
// @param {boolean} [opts.debug]
// @param {string[]} opts.defaultAssignees
//   - Fallback security assignees (GitHub usernames).
//     Caller must provide this; no hardcoded default.
export default async function cleanupSecurityActionMessages ({
  token = null,
  github = null,
  channel = '#secops-hotspots',
  debug = false,
  defaultAssignees = []
}) {
  if (!token) {
    throw new Error('token is required!')
  }
  if (!github) {
    throw new Error('github is required!')
  }
  if (defaultAssignees.length === 0) {
    console.log(
      'cleanup: no defaultAssignees provided, ' +
      'signals C/D may not work correctly'
    )
  }

  debug = debug === 'true' || debug === true

  const { WebClient } = await import('@slack/web-api')
  const web = new WebClient(token)

  const channelId = await findChannelId(web, channel)

  // Fetch messages from the last 30 days (paginated).
  const allMessages = await fetchMessages(
    web, channelId, 30
  )

  const messages = allMessages.filter(
    m => m.username === SECURITY_ACTION_USERNAME
  )

  if (messages.length === 0) {
    if (debug) {
      console.log(
        'cleanup: no security-action messages found'
      )
    }
    return 0
  }

  if (debug) {
    console.log(
      `cleanup: found ${messages.length} ` +
      'security-action message(s) to evaluate'
    )
  }

  const toDelete = []

  for (const msg of messages) {
    // Reactions are included in the history response,
    // so no separate reactions.get call is needed.
    const reactions = msg.reactions || []

    // Extract /cc user IDs for signals A and B.
    const ccUserIds = parseCcUserIds(msg.text)

    // Signal A: checkmark reaction from a /cc'd
    // person.
    if (ccUserIds.length > 0) {
      const hasCheckmark = reactions.some(r => {
        if (!CHECKMARK_REACTIONS.includes(r.name)) {
          return false
        }
        return (r.users || []).some(
          uid => ccUserIds.includes(uid)
        )
      })

      if (hasCheckmark) {
        if (debug) {
          console.log(
            `cleanup: ts=${msg.ts} has checkmark ` +
            'from cc\'d person'
          )
        }
        toDelete.push(msg)
        continue
      }
    }

    // Signal B: thumbsup from a /cc'd person.
    if (ccUserIds.length > 0) {
      const hasThumbsup = reactions.some(r => {
        if (!THUMBSUP_REACTIONS.includes(r.name)) {
          return false
        }
        return (r.users || []).some(
          uid => ccUserIds.includes(uid)
        )
      })

      if (hasThumbsup) {
        if (debug) {
          console.log(
            `cleanup: ts=${msg.ts} has thumbsup ` +
            'from cc\'d person'
          )
        }
        toDelete.push(msg)
        continue
      }
    }

    // For signals C and D we need the PR URL.
    const prUrl = extractPrUrl(msg)
    const pr = parsePrUrl(prUrl)
    if (!pr) {
      if (debug) {
        console.log(
          `cleanup: ts=${msg.ts} no PR URL found`
        )
      }
      continue
    }

    try {
      // Fetch review threads (for assignees + D).
      const threadResult = await github.graphql(
        REVIEW_THREADS_QUERY,
        {
          owner: pr.owner,
          name: pr.repo,
          prnumber: pr.number
        }
      )
      const threads =
        threadResult.repository.pullRequest
          .reviewThreads

      // Determine the assignees for this PR.
      const assignees = extractAssigneesFromThreads(
        threads, defaultAssignees
      )

      // Signal C: label removed by assignee.
      const labelRemoved = await checkLabelRemoved(
        github, pr, assignees
      )
      if (labelRemoved) {
        if (debug) {
          console.log(
            `cleanup: ts=${msg.ts} label removed ` +
            'by assignee'
          )
        }
        toDelete.push(msg)
        continue
      }

      // Signal D: all threads resolved by assignee.
      const allResolved = checkAllThreadsResolved(
        threads, assignees
      )
      if (allResolved) {
        if (debug) {
          console.log(
            `cleanup: ts=${msg.ts} all threads ` +
            'resolved by assignee'
          )
        }
        toDelete.push(msg)
        continue
      }
    } catch (err) {
      if (debug) {
        console.log(
          'cleanup: error checking PR ' +
          `${prUrl}: ${err.message}`
        )
      }
      // Don't delete on error — leave the message.
    }
  }

  if (debug) {
    console.log(
      `cleanup: ${toDelete.length} message(s) ` +
      'marked for deletion'
    )
    for (const msg of toDelete) {
      console.log(`  would delete ts=${msg.ts}`)
    }
    return toDelete.length
  }

  let deleted = 0
  for (const msg of toDelete) {
    try {
      await web.chat.delete({
        channel: channelId, ts: msg.ts
      })
      deleted++

      if (toDelete.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1200))
      }
    } catch (err) {
      console.error(
        'cleanup: failed to delete ' +
        `ts=${msg.ts}: ${err.message}`
      )
    }
  }

  console.log(`cleanup: deleted ${deleted} message(s)`)

  return deleted
}
