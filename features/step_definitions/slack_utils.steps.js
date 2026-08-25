import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import {
  findChannelId,
  fetchMessages,
  fetchThreadReplies,
  chunkNudgeMessage,
  isBotOwned,
  deleteMessages,
  prepareSlackContext
} from '../../src/slackUtils.js'

Given('a Slack client whose channels include {string}', function (name) {
  this.web = this.makeMockSlackWeb({ channelPages: [[{ name, id: 'C001' }]] })
})

Given('a Slack client where {string} is on the second page', function (name) {
  this.web = this.makeMockSlackWeb({
    channelPages: [
      [{ name: 'general', id: 'C000' }],
      [{ name, id: 'C001' }]
    ]
  })
})

When('resolving the channel {string}', async function (channel) {
  await this.attempt(() => findChannelId(this.web, channel))
})

Then('the channel id is resolved', function () {
  assert.equal(this.result, 'C001')
})

Then('the client listed channels twice', function () {
  assert.equal(this.web.__recorder.count('conversations.list'), 2)
})

Then('resolving fails with {string}', function (message) {
  assert.equal(this.error.message, message)
})

Given('a Slack client with two messages in history', function () {
  this.web = this.makeMockSlackWeb({
    messages: [{ ts: '1', text: 'hello' }, { ts: '2', text: 'world' }]
  })
})

When('fetching messages for the last seven days', async function () {
  this.result = await fetchMessages(this.web, 'C001', 7)
})

Then('two messages are returned', function () {
  assert.equal(this.result.length, 2)
})

Given('a Slack client with paginated history', function () {
  this.web = this.makeMockSlackWeb({
    historyPages: [
      [{ ts: '1', text: 'first' }],
      [{ ts: '2', text: 'second' }]
    ]
  })
})

Then('all pages are returned', function () {
  assert.deepEqual(this.result.map(m => m.ts), ['1', '2'])
})

Then('the client fetched history twice', function () {
  assert.equal(this.web.__recorder.count('conversations.history'), 2)
})

Given('a Slack client with paginated thread replies', function () {
  this.web = this.makeMockSlackWeb({
    historyPages: [[{ ts: '1111.2222', text: 'parent', reply_count: 4 }]],
    repliesByTs: {
      1111.2222: [
        { ts: '1111.2222', text: 'parent' },
        { ts: '1111.2223', text: 'reply one' },
        { ts: '1111.2224', text: 'reply two' },
        { ts: '1111.2225', text: 'reply three' }
      ]
    }
  })
})

When('fetching replies of thread {string}', async function (ts) {
  this.result = await fetchThreadReplies(this.web, 'C001', ts)
})

Then('all reply pages are returned', function () {
  assert.equal(this.result.length, 4)
})

When('chunking a message of three alerts with one alert per chunk', function () {
  this.chunks = chunkNudgeMessage('alert one\n\n---\n\nalert two\n\n---\n\nalert three', 1)
})

Then('three chunks are produced', function () {
  assert.equal(this.chunks.length, 3)
})

When('chunking a message with blank alert parts with one alert per chunk', function () {
  this.chunks = chunkNudgeMessage('alert one\n\n---\n\n   \n\n---\n\nalert two', 1)
})

Then('no empty chunk is produced', function () {
  assert.ok(this.chunks.every(c => c.trim().length > 0))
  assert.equal(this.chunks.length, 2)
})

When('chunking a message of three alerts with two alerts per chunk', function () {
  this.chunks = chunkNudgeMessage('alert one\n\n---\n\nalert two\n\n---\n\nalert three', 2)
})

Then('two chunks are produced', function () {
  assert.equal(this.chunks.length, 2)
})

Then('the first chunk contains two alerts', function () {
  assert.ok(this.chunks[0].includes('alert one'))
  assert.ok(this.chunks[0].includes('alert two'))
  assert.ok(this.chunks[0].includes('\n\n---\n\n'))
})

When('chunking a plain message with one alert per chunk', function () {
  this.chunks = chunkNudgeMessage('just a plain message', 1)
})

Then('one chunk is produced', function () {
  assert.deepEqual(this.chunks, ['just a plain message'])
})

Given('a message with bot id {string}', function (botId) {
  this.message = { bot_id: botId, text: 'bot post' }
})

Then('the message is owned by bot {string}', function (botId) {
  assert.equal(isBotOwned(this.message, botId), true)
})

Then('the message is not owned by bot {string}', function (botId) {
  assert.equal(isBotOwned(this.message, botId), false)
})

Given('a message with metadata event type {string}', function (eventType) {
  this.message = { metadata: { event_type: eventType } }
})

Given('a plain user message', function () {
  this.message = { user: 'U1', text: 'human post' }
})

Then('the message is bot owned without a bot id', function () {
  assert.equal(isBotOwned(this.message, null), true)
})

Then('the message is not bot owned without a bot id', function () {
  assert.equal(isBotOwned(this.message, null), false)
})

Given('a Slack client with one bot message without replies', function () {
  this.web = this.makeMockSlackWeb({ messages: [] })
  this.msgs = [{ ts: '100', bot_id: 'B123', text: 'orphan' }]
})

async function withCappedTimers (fn) {
  const realSetTimeout = globalThis.setTimeout
  globalThis.setTimeout = (f, ms) => realSetTimeout(f, Math.min(Number(ms) || 0, 1))
  try {
    return await fn()
  } finally {
    globalThis.setTimeout = realSetTimeout
  }
}

When('deleting the messages', async function () {
  this.result = await withCappedTimers(() => deleteMessages(this.web, 'C001', this.msgs, false))
})

Then('the deletion count is one', function () {
  assert.equal(this.result, 1)
})

Given('a Slack client with a bot thread parent with two managed replies', function () {
  this.web = this.makeMockSlackWeb({
    repliesByTs: {
      200: [
        { ts: '200', bot_id: 'B123' },
        { ts: '201', bot_id: 'B123' },
        { ts: '202', bot_id: 'B123' }
      ]
    }
  })
  this.msgs = [{ ts: '200', bot_id: 'B123', reply_count: 2 }]
})

Then('the deletion count is three', function () {
  assert.equal(this.result, 3)
})

Then('replies are deleted before their parent', function () {
  const ts = this.web.__recorder.paramsOf('chat.delete').map(p => p.ts)
  assert.deepEqual(ts, ['201', '202', '200'])
})

Given('a Slack client with a bot thread parent with one human reply', function () {
  this.web = this.makeMockSlackWeb({
    repliesByTs: {
      200: [
        { ts: '200', bot_id: 'B123' },
        { ts: '201', user: 'U999' }
      ]
    }
  })
  this.msgs = [{ ts: '200', bot_id: 'B123', reply_count: 1 }]
})

Then('the deletion count is zero', function () {
  assert.equal(this.result, 0)
  assert.equal(this.web.__recorder.count('chat.delete'), 0)
})

Given('a Slack client with a bot thread parent with two managed replies and a failing delete', function () {
  this.web = this.makeMockSlackWeb({
    chatDeleteFailFor: ['202', '200'],
    repliesByTs: {
      200: [
        { ts: '200', bot_id: 'B123' },
        { ts: '201', bot_id: 'B123' },
        { ts: '202', bot_id: 'B123' }
      ]
    }
  })
  this.msgs = [{ ts: '200', bot_id: 'B123', reply_count: 2 }]
})

Then('the deletion stops after the first failure', function () {
  const ts = this.web.__recorder.paramsOf('chat.delete').map(p => p.ts)
  assert.deepEqual(ts, ['201', '202'])
  assert.equal(this.result, 1)
})

Given('a Slack client with two bot messages without replies', function () {
  this.web = this.makeMockSlackWeb({ messages: [] })
  this.msgs = [{ ts: '100', bot_id: 'B123' }, { ts: '101', bot_id: 'B123' }]
})

When('deleting the messages in debug mode', async function () {
  this.result = await withCappedTimers(() => deleteMessages(this.web, 'C001', this.msgs, true))
})

Then('the debug deletion count is two', function () {
  assert.equal(this.result, 2)
})

Then('no API deletion happened', function () {
  assert.equal(this.web.__recorder.count('chat.delete'), 0)
})

When('preparing a Slack context for channel {string}', async function (_channel) {
  this.result = await prepareSlackContext('xoxb-test', this.channelName, 7, this.web)
})

Then('the context has a resolved channel id', function () {
  assert.equal(this.result.channelId, 'C001')
})

Then('the context holds the fetched messages', function () {
  assert.equal(this.result.messages.length, 2)
})

Given('a Slack client whose channels include {string} and two messages in history', function (name) {
  this.channelName = `#${name}`
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name, id: 'C001' }]],
    messages: [{ ts: '1', text: 'hello' }, { ts: '2', text: 'world' }]
  })
})
