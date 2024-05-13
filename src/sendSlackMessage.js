// send markdown message to slack channel
export default async function sendSlackMessage ({
  token = null,
  channel = null,
  message = null,
  debug = false,
  username = 'github-actions'
}) {
  if (!token) {
    throw new Error('token is required!')
  }

  if (!channel) {
    throw new Error('channel is required!')
  }

  if (!message) {
    throw new Error('message is required!')
  }

  debug = debug === 'true' || debug === true

  if (debug) { console.log(`token.length: ${token.length}, channel: ${channel}, message: ${message}`) }

  const { WebClient } = await import('@slack/web-api')
  const { markdownToBlocks } = await import('@tryfabric/mack')

  const web = new WebClient(token)
  let blocks = await markdownToBlocks(message)

  if (debug) { console.log(blocks) }

  if (blocks.length > 50) {
    blocks = blocks.slice(0, 49)
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '...and more'
      }
    })
  }

  const result = await web.chat.postMessage({
    username,
    text: `${username} alert`,
    channel,
    blocks
  })

  if (debug) { console.log(`result: ${JSON.stringify(result)}`) }

  return result
}
