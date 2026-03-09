async function findChannelId (web, name) {
  let cursor = null

  while (true) {
    const r = await web.conversations.list({ cursor })
    const f = r.channels.find(c => c.name === name || c.name === name.substring(1))

    if (f) {
      return f.id
    }

    if (!r.response_metadata.next_cursor) {
      throw new Error('channel not found')
    }

    cursor = r.response_metadata.next_cursor
  }
}

// Delete Slack messages from a channel that were posted by a given username and
// whose metadata.event_payload.repo matches one of the provided repo full names.
// Falls back to text-matching the repo name in the message content for older
// messages that were posted before the eventPayload metadata was introduced.
//
// @param {object} options
// @param {string} options.token        - Slack bot token
// @param {string} options.channel      - Channel name (e.g. '#secops-hotspots')
// @param {string} options.username     - Bot username to filter by (e.g. 'dependabot')
// @param {string[]} options.repos      - List of repo full names (e.g. ['org/repo-name'])
// @param {boolean} [options.debug]     - If true, log actions without deleting
// @param {number} [options.lookbackDays] - How many days back to search (default: 8)
// @returns {Promise<number>}           - Number of messages deleted
export default async function deleteSlackMessages ({
  token = null,
  channel = null,
  username = null,
  repos = [],
  debug = false,
  lookbackDays = 8
}) {
  if (!token) {
    throw new Error('token is required!')
  }

  if (!channel) {
    throw new Error('channel is required!')
  }

  if (!username) {
    throw new Error('username is required!')
  }

  if (!repos || repos.length === 0) {
    return 0
  }

  debug = debug === 'true' || debug === true

  const { WebClient } = await import('@slack/web-api')
  const web = new WebClient(token)

  const channelId = await findChannelId(web, channel)

  // Fetch messages going back lookbackDays days using pagination
  const oldest = Date.now() / 1000 - 60 * 60 * 24 * lookbackDays
  const messages = []
  let cursor = null

  while (true) {
    const response = await web.conversations.history({
      channel: channelId,
      oldest,
      limit: 200,
      cursor
    })

    messages.push(...response.messages)

    if (!response.has_more || !response.response_metadata?.next_cursor) {
      break
    }

    cursor = response.response_metadata.next_cursor
  }

  // Filter to messages posted by the target username that reference one of the
  // dismissed repos. We check two sources in priority order:
  //   1. metadata.event_payload.repo  (set by the new nudge code)
  //   2. message text content         (fallback for older messages)
  const toDelete = messages.filter(m => {
    if (m.username !== username) return false

    // Check metadata first (reliable)
    const payloadRepo = m.metadata?.event_payload?.repo
    if (payloadRepo) {
      return repos.includes(payloadRepo)
    }

    // Fallback: scan the message text blocks for the repo name
    const textContent = [
      m.text || '',
      ...(m.blocks || []).map(b => b.text?.text || ''),
      ...(m.attachments || []).flatMap(a => (a.blocks || []).map(b => b.text?.text || ''))
    ].join(' ')

    return repos.some(repo => textContent.includes(repo))
  })

  if (debug) {
    console.log(`deleteSlackMessages: found ${toDelete.length} message(s) to delete for repos: ${repos.join(', ')}`)
    for (const m of toDelete) {
      console.log(`  would delete ts=${m.ts} repo=${m.metadata?.event_payload?.repo || '(text match)'}`)
    }
    return toDelete.length
  }

  let deleted = 0
  for (const m of toDelete) {
    try {
      await web.chat.delete({ channel: channelId, ts: m.ts })
      deleted++

      // Slack rate-limits chat.delete to ~1 req/sec on the tier most bots use.
      // Add a small delay between deletions to stay well within limits.
      if (toDelete.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1200))
      }
    } catch (err) {
      console.error(`deleteSlackMessages: failed to delete ts=${m.ts}: ${err.message}`)
    }
  }

  return deleted
}
