// Shared Slack utilities used across multiple modules.
// This is the only module that imports the Slack SDK, so
// everything else can be tested with plain mock clients.

// Create a Slack SDK client. Kept here so @slack/web-api
// is imported in exactly one place.
export async function createSlackClient (token) {
  const { WebClient } = await import('@slack/web-api')
  return new WebClient(token)
}

// Bootstrap shared by the actions and CLI tools: create
// the client, resolve the channel name, and fetch the
// lookback history in one call.
export async function prepareSlackContext (
  token, channel, lookbackDays, _web = null
) {
  const web = _web || await createSlackClient(token)
  const channelId = await findChannelId(web, channel)
  const messages = await fetchMessages(web, channelId, lookbackDays)
  return { web, channelId, messages }
}

// Slack rate limits message writes to roughly one per
// second per channel; every write path paces with this.
export function pace (ms = 1200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Resolve a Slack channel name (e.g. '#secops-hotspots'
// or 'secops-hotspots') to its channel ID.
export async function findChannelId (web, name) {
  let cursor = null

  while (true) {
    const r = await web.conversations.list({ cursor })
    const f = r.channels.find(
      c => c.name === name ||
        c.name === name.substring(1)
    )

    if (f) return f.id

    if (!r.response_metadata.next_cursor) {
      throw new Error('channel not found')
    }

    cursor = r.response_metadata.next_cursor
  }
}

// Fetch all messages from a channel within a lookback
// window (in days). Paginates automatically.
export async function fetchMessages (
  web, channelId, lookbackDays
) {
  const oldest =
    Date.now() / 1000 - 60 * 60 * 24 * lookbackDays
  const messages = []
  let cursor = null

  while (true) {
    const response = await web.conversations.history({
      channel: channelId,
      oldest,
      limit: 200,
      cursor,
      include_all_metadata: true
    })

    messages.push(...response.messages)

    const next =
      response.response_metadata?.next_cursor
    if (!response.has_more || !next) break

    cursor = next
  }

  return messages
}

// Fetch every reply of a thread, paginating until Slack has
// no more. Threads are capped at 200 replies per page, so a
// single request misses the cc marker or findings on busy
// threads.
export async function fetchThreadReplies (web, channelId, ts) {
  const messages = []
  let cursor = null

  while (true) {
    const response = await web.conversations.replies({
      channel: channelId,
      ts,
      limit: 200,
      ...(cursor ? { cursor } : {}),
      include_all_metadata: true
    })

    messages.push(...(response.messages || []))

    const next = response.response_metadata?.next_cursor
    if (!response.has_more || !next) break

    cursor = next
  }

  return messages
}

// Split a repo nudge findings message into thread-sized
// chunks on the '\n\n---\n\n' alert separator. Slack caps a
// message at 50 blocks and each alert renders as ~4 blocks,
// so chunking keeps long repos from being truncated. The
// parent summary and cc line are posted separately.
export function chunkNudgeMessage (
  message, maxAlertsPerMessage = 10
) {
  const separator = '\n\n---\n\n'
  const parts = message
    .split(separator)
    .filter(p => p.trim().length > 0)
  const chunks = []

  for (let i = 0; i < parts.length; i += maxAlertsPerMessage) {
    chunks.push(
      parts.slice(i, i + maxAlertsPerMessage).join(separator)
    )
  }

  return chunks
}

// Slack only lets this bot delete its own messages. When the
// owning bot's id is known (the thread parent's bot_id), that
// identity is the only proof that counts. Without it, only
// nudge metadata marks a reply as safe to manage; other
// apps' bot posts must stay.
export function isBotOwned (message, botId = null) {
  const m = message || {}
  const tagged =
    m.metadata?.event_type ||
    m.metadata?.event_payload?.kind

  if (botId) {
    return m.bot_id === botId
  }

  return Boolean(tagged)
}

// Whether a weekly nudge thread finished posting. The cc
// reply is the completion marker: findings chunks can land
// before it, so reply_count alone is not enough.
export function nudgeThreadProgress (thread, parentTs) {
  const replies = (thread || []).filter(m => m.ts !== parentTs)
  return {
    complete: replies.some(
      m => m.metadata?.event_payload?.kind === 'cc'
    ),
    postedAlerts: replies.filter(
      m => m.metadata?.event_payload?.kind === 'alerts'
    ).length
  }
}

// Collect the timestamps to delete for a message: its own,
// preceded by the timestamps of its thread replies.
// Deleting a thread parent on its own leaves the replies in
// the channel behind a "message deleted" placeholder, so
// the replies have to go first. Human replies cannot be
// deleted by this bot; if any exist, keep the parent too.
async function threadTimestamps (web, channelId, m) {
  if (!m.reply_count) return [m.ts]

  try {
    const replies = (await fetchThreadReplies(web, channelId, m.ts))
      .filter(r => r.ts !== m.ts)
    const unmanaged = replies.filter(r => !isBotOwned(r, m.bot_id))
    const managed = replies.filter(r => isBotOwned(r, m.bot_id))

    if (unmanaged.length > 0) {
      console.log(
        'deleteSlackMessages: preserving parent ' +
        `ts=${m.ts} (${unmanaged.length} human ` +
        `${unmanaged.length === 1 ? 'reply' : 'replies'})`
      )
      return managed.map(r => r.ts)
    }

    return [...managed.map(r => r.ts), m.ts]
  } catch (err) {
    console.error(
      'deleteSlackMessages: failed to list replies of ' +
      `ts=${m.ts}: ${err.message}; leaving parent in place`
    )
    return []
  }
}

// Delete Slack messages, and their thread replies, with
// rate-limit-safe delays. In debug mode, logs what would be
// deleted and returns the count without actually deleting.
export async function deleteMessages (
  web, channelId, msgs, debug
) {
  let deleted = 0

  for (const m of msgs) {
    const repo =
      m.metadata?.event_payload?.repo ||
      '(text match)'
    const timestamps =
      await threadTimestamps(web, channelId, m)

    if (debug) {
      console.log(
        `  would delete ts=${m.ts} repo=${repo}` +
        ` (${timestamps.length} message(s) incl. replies)`
      )
      deleted += timestamps.length
      continue
    }

    for (const ts of timestamps) {
      try {
        // Pace every deletion after the first.
        if (deleted > 0) {
          await pace()
        }

        await web.chat.delete({ channel: channelId, ts })
        deleted++
      } catch (err) {
        console.error(
          'deleteSlackMessages: failed to delete ' +
          `ts=${ts}: ${err.message}`
        )
        // Replies are deleted before the parent: once one
        // fails, stop so the parent is not deleted out
        // from under it. The next run retries the thread.
        break
      }
    }
  }

  return deleted
}
