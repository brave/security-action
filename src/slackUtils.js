// Shared Slack utilities used across multiple modules.

// Resolve a Slack channel name (e.g. '#secops-hotspots'
// or 'secops-hotspots') to its channel ID.
export async function findChannelId (web, name) {
  let cursor = null

  while (true) {
    const r = await web.conversations.list({ cursor })
    const f = r.channels.find(
      c => c.name === name
        || c.name === name.substring(1)
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
      cursor
    })

    messages.push(...response.messages)

    const next =
      response.response_metadata?.next_cursor
    if (!response.has_more || !next) break

    cursor = next
  }

  return messages
}

// Delete Slack messages with rate-limit-safe delays.
// In debug mode, logs what would be deleted and returns
// the count without actually deleting.
export async function deleteMessages (
  web, channelId, msgs, debug
) {
  if (debug) {
    for (const m of msgs) {
      const repo =
        m.metadata?.event_payload?.repo
        || '(text match)'
      console.log(
        `  would delete ts=${m.ts} repo=${repo}`
      )
    }
    return msgs.length
  }

  let deleted = 0
  for (const m of msgs) {
    try {
      await web.chat.delete({
        channel: channelId, ts: m.ts
      })
      deleted++

      if (msgs.length > 1) {
        await new Promise(r => setTimeout(r, 1200))
      }
    } catch (err) {
      console.error(
        'deleteSlackMessages: failed to delete ' +
        `ts=${m.ts}: ${err.message}`
      )
    }
  }

  return deleted
}
