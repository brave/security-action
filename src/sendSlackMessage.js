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
  username = 'github-actions'
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

  if (colorCodes[color]) {
    color = colorCodes[color]
  }

  const colored = color?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)

  debug = debug === 'true' || debug === true

  if (debug) { console.log(`token.length: ${token.length}, channel: ${channel}, message: ${message}`) }

  const { WebClient } = await import('@slack/web-api')

  const web = new WebClient(token)

  // calculate the sha256 hash of the message
  const crypto = await import('crypto')
  const hash = crypto.createHash('sha256')
  if (text !== null) hash.update(text)
  if (message !== null) hash.update(message)
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
      mdBlocks = mdBlocks.slice(0, 49)
      mdBlocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '...and more'
        }
      })
    }
    if (colored) {
      attachments = [{
        color,
        blocks: mdBlocks
      }]
    } else {
      blocks.push(...mdBlocks)
    }
    if (debug) { console.log(mdBlocks) }
  }

  // get the channel id
  const channelId = await findChannelId(web, channel)

  // get last 50 messages from the channel, in the last day
  const history = await web.conversations.history({
    channel: channelId,
    limit: 50,
    oldest: Date.now() / 1000 - 60 * 60 * 24 // a day ago
  })

  // debounce messages if the same message was sent in the last day
  if (history.messages.some(m => m.metadata?.event_type === hashHex)) {
    if (debug) {
      throw new Error('debounce message')
    } else {
      return
    }
  }

  const metadata = { event_type: hashHex, event_payload: { } }

  // send the message
  const result = await web.chat.postMessage({
    username,
    text: text || `${username} alert`,
    channel,
    link_names: true,
    unfurl_links: true,
    unfurl_media: true,
    blocks,
    attachments,
    metadata
  })

  if (debug) { console.log(`result: ${JSON.stringify(result)}`) }

  return result
}
