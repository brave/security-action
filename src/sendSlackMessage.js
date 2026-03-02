async function findChannelId (web, name) {
  let cursor = null

  while (true) {
    const r = await web.conversations.list({ cursor })
    const f = r.channels.find(
      (c) => c.name === name || c.name === name.substring(1)
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

/**
 * Find existing thread for a PR by searching message metadata
 * @param {object} web - Slack WebClient instance
 * @param {string} channelId - Channel ID to search
 * @param {string} prIdentifier - PR identifier (e.g., "brave/repo#123")
 * @returns {string|null} Thread timestamp if found, null otherwise
 */
export async function findExistingThreadForPR (web, channelId, prIdentifier) {
  // Search last 100 messages from the last 30 days for a thread parent
  const history = await web.conversations.history({
    channel: channelId,
    limit: 100,
    oldest: Date.now() / 1000 - 60 * 60 * 24 * 30 // 30 days ago
  })

  // Find message with matching PR identifier in metadata
  const existingThread = history.messages.find(
    (m) =>
      m.metadata?.event_type === 'security_action_thread' &&
      m.metadata?.event_payload?.pr_identifier === prIdentifier
  )

  return existingThread?.ts || null
}

/**
 * Add a completion reaction (checkmark) to a message
 * @param {object} web - Slack WebClient instance
 * @param {string} channelId - Channel ID
 * @param {string} threadTs - Timestamp of the message to react to
 * @returns {boolean} True if successful
 */
export async function addCompletionReaction (web, channelId, threadTs) {
  try {
    await web.reactions.add({
      channel: channelId,
      timestamp: threadTs,
      name: 'white_check_mark' // ✅ emoji
    })
    return true
  } catch (error) {
    // Reaction may already exist, which is fine
    if (error.data?.error === 'already_reacted') {
      return true
    }
    throw error
  }
}

const colorCodes = {
  black: '#000000',
  red: '#F44336',
  green: '#4CAF50',
  yellow: '#FFEB3B',
  blue: '#2196F3',
  magenta: '#FF00FF',
  cyan: '#00BCD4',
  white: '#FFFFFF'
}

// send markdown message to slack channel
export default async function sendSlackMessage ({
  token = null,
  text = null,
  channel = null,
  message = null,
  debug = false,
  color = null,
  username = 'github-actions',
  prIdentifier = null, // e.g., "brave/brave-browser#12345" - enables threading
  isCompletion = false // true when review is complete - adds reaction to parent
}) {
  if (!token) {
    throw new Error('token is required!')
  }

  if (!channel) {
    throw new Error('channel is required!')
  }

  if (!message && !text) {
    throw new Error('message || token is required!')
  }

  // Determine if we should use threading mode
  const useThreading = prIdentifier !== null

  const filteredMessage = message?.replace(/Findings: \d+/g, 'Findings: n+')

  if (colorCodes[color]) {
    color = colorCodes[color]
  }

  const colored = color?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)

  debug = debug === 'true' || debug === true

  if (debug) {
    console.log(
      `token.length: ${token.length}, channel: ${channel}, message: ${message}`
    )
  }

  const { WebClient } = await import('@slack/web-api')

  const web = new WebClient(token)

  // calculate the sha256 hash of the message
  const crypto = await import('crypto')
  const hash = crypto.createHash('sha256')
  if (text !== null) hash.update(text)
  if (filteredMessage !== null) hash.update(filteredMessage)
  if (color !== null) hash.update(color)
  const hashHex = hash.digest('hex')

  const blocks = []
  let attachments = null

  if (text !== null) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text
      }
    })
  }

  if (message !== null) {
    const { markdownToBlocks } = await import('@tryfabric/mack')

    let mdBlocks = await markdownToBlocks(message)
    // slack blocks have a limit of 50 blocks, remove the last blocks if there are more
    if (mdBlocks.length > 50) {
      // last block should contain the Cc, so we don't want to remove it
      const lastBlock = mdBlocks[mdBlocks.length - 1]
      mdBlocks = mdBlocks.slice(0, 48)
      mdBlocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '...and more'
        }
      })
      mdBlocks.push(lastBlock)
    }
    if (colored) {
      attachments = [
        {
          color,
          blocks: mdBlocks
        }
      ]
    } else {
      blocks.push(...mdBlocks)
    }
    if (debug) {
      console.log(mdBlocks)
    }
  }

  // get the channel id
  const channelId = await findChannelId(web, channel)

  let threadTs = null
  let isNewThread = false

  if (useThreading) {
    // Look for existing thread for this PR
    threadTs = await findExistingThreadForPR(web, channelId, prIdentifier)
    isNewThread = threadTs === null

    if (debug) {
      console.log(
        `Thread discovery: prIdentifier=${prIdentifier}, existingThread=${threadTs}, isNew=${isNewThread}`
      )
    }
  } else {
    // Non-threaded mode: use existing debounce logic
    const history = await web.conversations.history({
      channel: channelId,
      limit: 50,
      oldest: Date.now() / 1000 - 60 * 60 * 24 // a day ago
    })

    // debounce messages if the same message was sent in the last day
    if (history.messages.some((m) => m.metadata?.event_type === hashHex)) {
      if (debug) {
        throw new Error('debounce message')
      } else {
        return
      }
    }
  }

  // Build metadata for thread parent (only used for new threads)
  const metadata =
    useThreading && isNewThread
      ? {
          event_type: 'security_action_thread',
          event_payload: { pr_identifier: prIdentifier }
        }
      : { event_type: hashHex, event_payload: {} }

  // Build message options
  const messageOptions = {
    username,
    text: text || `${username} alert`,
    channel,
    link_names: true,
    unfurl_links: true,
    unfurl_media: true,
    blocks,
    attachments
  }

  // Add threading if we have an existing thread
  if (threadTs) {
    messageOptions.thread_ts = threadTs
  } else {
    // Only add metadata to parent messages (new threads or non-threaded)
    messageOptions.metadata = metadata
  }

  // send the message
  const result = await web.chat.postMessage(messageOptions)

  if (debug) {
    console.log(`result: ${JSON.stringify(result)}`)
  }

  // If this is a completion message and we have a thread, add reaction to parent
  if (isCompletion && threadTs) {
    await addCompletionReaction(web, channelId, threadTs)
    if (debug) {
      console.log('Added completion reaction to thread parent')
    }
  }

  return result
}
