import assert from 'node:assert'
import { test } from 'node:test'

// Shared fake Slack client capturing calls.
function buildFakeWeb ({ repliesMessages = [], historyMessages = [] } = {}) {
  const calls = {
    postMessage: [],
    history: [],
    replies: []
  }
  const web = {
    chat: {
      postMessage: async (params) => {
        calls.postMessage.push(params)
        return { ok: true, ts: '1234.5678', channel: 'C1' }
      }
    },
    conversations: {
      history: async (params) => {
        calls.history.push(params)
        return { messages: historyMessages }
      },
      replies: async (params) => {
        calls.replies.push(params)
        return { messages: repliesMessages }
      }
    }
  }
  const findChannelId = async () => 'C1'
  return { web, findChannelId, calls }
}

test('sendSlackMessage: threadTs is forwarded to chat.postMessage', async () => {
  const { web, findChannelId, calls } = buildFakeWeb()
  const { default: sendSlackMessage } = await import('./sendSlackMessage.js')

  await sendSlackMessage({
    token: 'xoxb-test',
    channel: '#test',
    text: 'hello thread',
    threadTs: '9999.0000',
    _web: web,
    _findChannelId: findChannelId
  })

  assert.strictEqual(calls.postMessage.length, 1)
  assert.strictEqual(calls.postMessage[0].thread_ts, '9999.0000')
  assert.strictEqual(calls.replies.length, 1)
  assert.strictEqual(calls.replies[0].ts, '9999.0000')
  assert.strictEqual(calls.history.length, 0)
})

test('sendSlackMessage: no threadTs uses channel history, omits thread_ts', async () => {
  const { web, findChannelId, calls } = buildFakeWeb()
  const { default: sendSlackMessage } = await import('./sendSlackMessage.js')

  await sendSlackMessage({
    token: 'xoxb-test',
    channel: '#test',
    text: 'top-level msg',
    _web: web,
    _findChannelId: findChannelId
  })

  assert.strictEqual(calls.postMessage.length, 1)
  assert.strictEqual(calls.postMessage[0].thread_ts, undefined)
  assert.strictEqual(calls.history.length, 1)
  assert.strictEqual(calls.replies.length, 0)
})

test('sendSlackMessage: eventType overrides metadata.event_type', async () => {
  const { web, findChannelId, calls } = buildFakeWeb()
  const { default: sendSlackMessage } = await import('./sendSlackMessage.js')

  await sendSlackMessage({
    token: 'xoxb-test',
    channel: '#test',
    text: 'parent',
    eventType: 'dependabot-nudge-weekly-parent',
    eventPayload: { org: 'brave', weekId: '2026-W29' },
    _web: web,
    _findChannelId: findChannelId
  })

  assert.strictEqual(
    calls.postMessage[0].metadata.event_type,
    'dependabot-nudge-weekly-parent'
  )
  assert.deepStrictEqual(calls.postMessage[0].metadata.event_payload, {
    org: 'brave',
    weekId: '2026-W29'
  })
})

test('sendSlackMessage: default event_type stays as message hash', async () => {
  const { web, findChannelId, calls } = buildFakeWeb()
  const { default: sendSlackMessage } = await import('./sendSlackMessage.js')

  await sendSlackMessage({
    token: 'xoxb-test',
    channel: '#test',
    text: 'hashed',
    _web: web,
    _findChannelId: findChannelId
  })

  // Default event_type is the sha256 of the text.
  assert.match(calls.postMessage[0].metadata.event_type, /^[0-9a-f]{64}$/)
})

test('sendSlackMessage: dedup via thread replies skips duplicate', async () => {
  const crypto = await import('crypto')
  const hash = crypto.createHash('sha256')
  hash.update('dup text')
  const hashHex = hash.digest('hex')

  const { web, findChannelId } = buildFakeWeb({
    repliesMessages: [{ metadata: { event_type: hashHex } }]
  })
  const { default: sendSlackMessage } = await import('./sendSlackMessage.js')

  const result = await sendSlackMessage({
    token: 'xoxb-test',
    channel: '#test',
    text: 'dup text',
    threadTs: '5555.0000',
    _web: web,
    _findChannelId: findChannelId
  })

  // Dedup returns undefined and never posts.
  assert.strictEqual(result, undefined)
})
