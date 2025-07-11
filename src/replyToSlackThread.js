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

// Find and reply to existing Slack thread based on PR information
export default async function replyToSlackThread ({
  token = null,
  channel = null,
  prNumber = null,
  repoName = null,
  replyText = null,
  debug = false,
  username = 'github-actions'
}) {
  if (!token) {
    throw new Error('token is required!')
  }

  if (!channel) {
    throw new Error('channel is required!')
  }

  if (!prNumber || !repoName) {
    throw new Error('prNumber and repoName are required!')
  }

  if (!replyText) {
    throw new Error('replyText is required!')
  }

  debug = debug === 'true' || debug === true

  if (debug) {
    console.log(`Looking for existing thread for PR #${prNumber} in ${repoName}`)
  }

  const { WebClient } = await import('@slack/web-api')
  const web = new WebClient(token)

  // get the channel id
  const channelId = await findChannelId(web, channel)

  // get last 100 messages from the channel, in the last 7 days
  const history = await web.conversations.history({
    channel: channelId,
    limit: 100,
    oldest: Date.now() / 1000 - 60 * 60 * 24 * 7 // 7 days ago
  })

  // Look for messages that mention this PR
  const prPattern = new RegExp(`#${prNumber}(?:\\s|$|\\)|\\])`, 'i')
  const repoPattern = new RegExp(repoName, 'i')
  
  const existingMessage = history.messages.find(message => {
    if (message.username !== username && message.bot_id !== username) {
      return false
    }
    
    // Check message text and blocks for PR reference
    const messageText = message.text || ''
    const blocksText = message.blocks ? 
      message.blocks.map(block => 
        block.text?.text || 
        block.elements?.map(el => el.text?.text || el.text || '').join(' ') || ''
      ).join(' ') : ''
    const attachmentsText = message.attachments ? 
      message.attachments.map(att => 
        att.blocks?.map(block => 
          block.text?.text || 
          block.elements?.map(el => el.text?.text || el.text || '').join(' ') || ''
        ).join(' ') || ''
      ).join(' ') : ''
    
    const fullText = `${messageText} ${blocksText} ${attachmentsText}`
    
    return prPattern.test(fullText) && repoPattern.test(fullText)
  })

  if (!existingMessage) {
    if (debug) {
      console.log(`No existing message found for PR #${prNumber} in ${repoName}`)
    }
    return null
  }

  if (debug) {
    console.log(`Found existing message for PR #${prNumber}, replying in thread`)
  }

  // Reply to the existing message thread
  const result = await web.chat.postMessage({
    username,
    text: replyText,
    channel: channelId,
    thread_ts: existingMessage.ts,
    link_names: true,
    unfurl_links: false,
    unfurl_media: false
  })

  if (debug) {
    console.log(`Reply result: ${JSON.stringify(result)}`)
  }

  return result
}