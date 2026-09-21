import {
  createSlackClient,
  fetchThreadReplies,
  findChannelId
} from './slackUtils.js'

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

// Slack truncates mrkdwn section text (~3000 chars) and hard-caps a
// message at 50 blocks, so long markdown (e.g. a dependabot dismiss
// digest with dozens of "also in #1234" back-references) gets cut
// mid-entity. Chunks stay under both ceilings: 2900 chars and 40
// lines (each bullet renders as roughly one block, leaving room for
// the "...more in thread" trailer plus margin).
const SLACK_CHUNK_LIMIT = 2900
const SLACK_CHUNK_MAX_LINES = 40

// Split markdown into chunks at line boundaries only — never inside a
// line, so no "[#123](https://...)" entity is ever half-cut by us.
// Exported for tests. A single line longer than the limit travels
// whole (Slack may still ellipsize it internally).
export function splitMessageForSlack (
  message,
  limit = SLACK_CHUNK_LIMIT,
  maxLines = SLACK_CHUNK_MAX_LINES
) {
  const lines = message.split('\n')
  const chunks = []
  let current = []
  let size = 0
  for (const line of lines) {
    const cost = line.length + (current.length > 0 ? 1 : 0)
    if (current.length > 0 && (size + cost > limit || current.length >= maxLines)) {
      chunks.push(current.join('\n'))
      current = [line]
      size = line.length
    } else {
      current.push(line)
      size += cost
    }
  }
  if (current.length > 0 || chunks.length === 0) chunks.push(current.join('\n'))
  return chunks
}

// Convert a markdown message to Slack blocks. Exported so
// the nudge refresh path can rebuild a message body for
// chat.update with the same rendering.
export async function messageToBlocks (message) {
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

  return mdBlocks
}

// send markdown message to slack channel
export default async function sendSlackMessage ({
  token = null,
  text = null,
  channel = null,
  channelId = null,
  message = null,
  debug = false,
  color = null,
  username = 'github-actions',
  eventPayload = {},
  threadTs = null,
  eventType = null,
  _web = null,
  _findChannelId = null
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

  const filteredMessage = message?.replace(/Findings: \d+/g, 'Findings: n+')

  if (colorCodes[color]) {
    color = colorCodes[color]
  }

  const colored = color?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)

  debug = debug === 'true' || debug === true

  if (debug) { console.log(`token.length: ${token.length}, channel: ${channel}, message: ${message}`) }

  let web = _web
  if (!web) {
    web = await createSlackClient(token)
  }

  // calculate the sha256 hash of the message
  const crypto = await import('crypto')
  const hash = crypto.createHash('sha256')
  if (text !== null) hash.update(text)
  if (filteredMessage != null) hash.update(filteredMessage)
  if (color != null) hash.update(color)
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

  // Long markdown overflows into a thread: the head chunk renders in
  // the top-level post with a "...more in thread" pointer, the rest
  // follow as replies rooted at that post (or at the caller's thread
  // when already replying — threads are flat, replies never nest).
  // The dedup hash above still covers the full original body, so
  // reruns debounce on the head post alone.
  let headMessage = message
  let overflowChunks = []
  if (message !== null) {
    const chunks = splitMessageForSlack(filteredMessage)
    if (chunks.length > 1) {
      const overflowLines = message.split('\n').length - chunks[0].split('\n').length
      headMessage = chunks[0] + `\n\n_…${overflowLines} more in thread →_`
      overflowChunks = chunks.slice(1)
    } else {
      headMessage = chunks[0]
    }
    const mdBlocks = await messageToBlocks(headMessage)
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

  // Resolve the channel once per call. Callers that already
  // know the channel ID (the nudge run resolved it up front)
  // skip the paginated conversations.list entirely.
  const targetChannelId = channelId ||
    (_findChannelId
      ? await _findChannelId(web, channel)
      : await findChannelId(web, channel))

  // When posting into a thread, dedup by scanning the
  // thread's replies instead of the channel history.
  // conversations.history only returns top-level messages
  // and would miss threaded replies. Replies paginate: a
  // single page could hide an earlier copy of this message
  // past the 200-reply mark.
  const history = threadTs
    ? {
        messages: await fetchThreadReplies(
          web, targetChannelId, threadTs
        )
      }
    : await web.conversations.history({
      channel: targetChannelId,
      limit: 50,
      oldest: Date.now() / 1000 - 60 * 60 * 24, // a day ago
      include_all_metadata: true
    })

  // debounce messages if the same message was sent in the last day
  if (history.messages.some(m => m.metadata?.event_type === hashHex)) {
    if (debug) {
      throw new Error('debounce message')
    } else {
      return
    }
  }

  const metadata = { event_type: eventType ?? hashHex, event_payload: eventPayload }

  // send the message
  const baseParams = {
    username,
    text: text || `${username} alert`,
    channel: targetChannelId,
    link_names: true,
    unfurl_links: true,
    unfurl_media: true,
    metadata
  }
  const result = await web.chat.postMessage({
    ...baseParams,
    blocks,
    attachments,
    ...(threadTs ? { thread_ts: threadTs } : {})
  })

  const rootTs = threadTs ?? result?.ts
  for (const chunk of overflowChunks) {
    await web.chat.postMessage({
      ...baseParams,
      blocks: await messageToBlocks(chunk),
      thread_ts: rootTs
    })
  }

  if (debug) { console.log(`result: ${JSON.stringify(result)}`) }

  return result
}
