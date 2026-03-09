async function findChannelId (web, name) {
  let cursor = null

  while (true) {
    const r = await web.conversations.list({ cursor })
    const f = r.channels.find(
      c => c.name === name || c.name === name.substring(1)
    )

    if (f) {
      return f.id
    }

    if (!r.response_metadata.next_cursor) {
      throw new Error('channel not found')
    }

    cursor = r.response_metadata.next_cursor
  }
}

// Fetch all messages from a channel within a lookback window.
async function fetchMessages (web, channelId, lookbackDays) {
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
    if (!response.has_more || !next) {
      break
    }

    cursor = next
  }

  return messages
}

// Extract the repo full name from a Slack message.
// Prefers metadata.event_payload.repo, falls back to
// text-matching org/repo patterns in the message body.
function extractRepoFromMessage (m) {
  const payloadRepo = m.metadata?.event_payload?.repo
  if (payloadRepo) return payloadRepo

  const textContent = [
    m.text || '',
    ...(m.blocks || []).map(b => b.text?.text || ''),
    ...(m.attachments || []).flatMap(
      a => (a.blocks || []).map(b => b.text?.text || '')
    )
  ].join(' ')

  // Match first occurrence of an org/repo link or mention.
  // Nudge messages start with [org/repo-name](url).
  const match = textContent.match(
    /\b([a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+)\b/
  )
  return match ? match[1] : null
}

// Delete messages with rate-limit-safe delays.
async function deleteMessages (web, channelId, msgs, debug) {
  if (debug) {
    for (const m of msgs) {
      const repo =
        m.metadata?.event_payload?.repo || '(text match)'
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

// List unique repo names that have Slack messages from a
// given username within the lookback window.
//
// @param {object} options
// @param {string} options.token       - Slack bot token
// @param {string} options.channel     - Channel name
// @param {string} options.username    - Bot username
// @param {boolean} [options.debug]
// @param {number} [options.lookbackDays] - Default: 8
// @returns {Promise<string[]>} Repo full names
export async function listSlackMessageRepos ({
  token = null,
  channel = null,
  username = null,
  debug = false,
  lookbackDays = 8
}) {
  if (!token || !channel || !username) {
    throw new Error(
      'token, channel, and username are required!'
    )
  }

  debug = debug === 'true' || debug === true

  const { WebClient } = await import('@slack/web-api')
  const web = new WebClient(token)

  const channelId = await findChannelId(web, channel)
  const messages = await fetchMessages(
    web, channelId, lookbackDays
  )

  const repos = new Set()
  for (const m of messages) {
    if (m.username !== username) continue

    const repo = extractRepoFromMessage(m)
    if (repo) repos.add(repo)
  }

  if (debug) {
    console.log(
      'listSlackMessageRepos: found repos: ' +
      Array.from(repos).join(', ')
    )
  }

  return Array.from(repos)
}

// Delete Slack messages from a channel posted by a given
// username whose repo matches one of the provided names.
//
// @param {object} options
// @param {string} options.token       - Slack bot token
// @param {string} options.channel     - Channel name
// @param {string} options.username    - Bot username
// @param {string[]} options.repos     - Repo full names
// @param {boolean} [options.debug]
// @param {number} [options.lookbackDays] - Default: 8
// @returns {Promise<number>} Number of messages deleted
export default async function deleteSlackMessages ({
  token = null,
  channel = null,
  username = null,
  repos = [],
  debug = false,
  lookbackDays = 8
}) {
  if (!token) throw new Error('token is required!')
  if (!channel) throw new Error('channel is required!')
  if (!username) {
    throw new Error('username is required!')
  }

  if (!repos || repos.length === 0) return 0

  debug = debug === 'true' || debug === true

  const { WebClient } = await import('@slack/web-api')
  const web = new WebClient(token)

  const channelId = await findChannelId(web, channel)
  const messages = await fetchMessages(
    web, channelId, lookbackDays
  )

  const toDelete = messages.filter(m => {
    if (m.username !== username) return false

    const payloadRepo =
      m.metadata?.event_payload?.repo
    if (payloadRepo) {
      return repos.includes(payloadRepo)
    }

    const textContent = [
      m.text || '',
      ...(m.blocks || []).map(
        b => b.text?.text || ''
      ),
      ...(m.attachments || []).flatMap(
        a => (a.blocks || []).map(
          b => b.text?.text || ''
        )
      )
    ].join(' ')

    return repos.some(
      repo => textContent.includes(repo)
    )
  })

  if (debug) {
    console.log(
      `deleteSlackMessages: found ${toDelete.length}` +
      ' message(s) to delete for repos: ' +
      repos.join(', ')
    )
  }

  return deleteMessages(web, channelId, toDelete, debug)
}
