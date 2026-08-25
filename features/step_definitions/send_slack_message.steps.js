import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import sendSlackMessage, { messageToBlocks } from '../../src/sendSlackMessage.js'

const sha256 = (...parts) => {
  const hash = crypto.createHash('sha256')
  for (const p of parts) {
    if (p !== null && p !== undefined) hash.update(p)
  }
  return hash.digest('hex')
}

function webWithHistory (messages, repliesByTs = {}) {
  return this.makeMockSlackWeb({
    channelPages: [[{ name: 'alerts', id: 'C001' }]],
    messages,
    repliesByTs
  })
}

Given('a Slack channel {string}', function (_channel) {
  this.web = webWithHistory.call(this, [])
})

When('sending a Slack message without a token', async function () {
  await this.attempt(() => sendSlackMessage({ text: 'hi', channel: '#alerts' }))
})

When('sending a Slack message without a channel', async function () {
  await this.attempt(() => sendSlackMessage({ token: 'xoxb-test', text: 'hi', _web: this.web }))
})

When('sending a Slack message without a message or text', async function () {
  await this.attempt(() => sendSlackMessage({ token: 'xoxb-test', channel: '#alerts', _web: this.web }))
})

Then('sending fails with {string}', function (message) {
  assert.equal(this.error.message, message)
})

When('sending a Slack message with markdown body and color {string}', async function (color) {
  await this.attempt(() => sendSlackMessage({
    token: 'xoxb-test',
    channel: '#alerts',
    message: '# Title\n\nsome *bold* markdown',
    color,
    _web: this.web
  }))
})

Then('the message is posted with attachment color {string}', function (color) {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params, 'chat.postMessage called')
  assert.equal(params.attachments[0].color, color)
})

Then('the message is posted without attachments', function () {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params)
  assert.ok(!params.attachments || params.attachments.length === 0)
  assert.ok(params.blocks.length > 0)
})

When('sending a Slack message with text {string}', async function (text) {
  await this.attempt(() => sendSlackMessage({
    token: 'xoxb-test',
    channel: '#alerts',
    text,
    _web: this.web
  }))
})

Then('the message is posted with text {string}', function (text) {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params, 'chat.postMessage called')
  assert.equal(params.text, text)
  assert.equal(params.blocks[0].text.text, text)
})

Given('a Slack channel {string} which already received the same message today', function (_channel) {
  this.web = webWithHistory.call(this, [
    { ts: '1', metadata: { event_type: sha256('hello world') } }
  ])
})

Given('a Slack channel {string} which already received a message with a findings count', function (_channel) {
  const previousBody = 'Findings: 12\n\nsome more'
    .replace(/Findings: \d+/g, 'Findings: n+')
  this.web = webWithHistory.call(this, [
    { ts: '1', metadata: { event_type: sha256('hello world', previousBody) } }
  ])
})

Then('no new message is posted', function () {
  assert.equal(this.web.__recorder.count('chat.postMessage'), 0)
})

When('sending a Slack message with text {string} in debug mode', async function (text) {
  await this.attempt(() => sendSlackMessage({
    token: 'xoxb-test',
    channel: '#alerts',
    text,
    debug: true,
    _web: this.web
  }))
})

When('sending a Slack message with text {string} and a message body with another findings count', async function (text) {
  await this.attempt(() => sendSlackMessage({
    token: 'xoxb-test',
    channel: '#alerts',
    text,
    message: 'Findings: 99\n\nsome more',
    _web: this.web
  }))
})

Given('a Slack channel {string} with thread {string} already containing the same message', function (_channel, threadTs) {
  this.web = webWithHistory.call(this, [], {
    [threadTs]: [
      { ts: threadTs, text: 'parent' },
      { ts: '1', metadata: { event_type: sha256('hello world') } }
    ]
  })
})

When('sending a Slack message with text {string} into thread {string}', async function (text, threadTs) {
  await this.attempt(() => sendSlackMessage({
    token: 'xoxb-test',
    channel: '#alerts',
    text,
    threadTs,
    _web: this.web
  }))
})

Then('the message is posted into thread {string}', function (threadTs) {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params, 'chat.postMessage called')
  assert.equal(params.thread_ts, threadTs)
})

When('sending a Slack message with text {string} to channel id {string}', async function (text, channelId) {
  await this.attempt(() => sendSlackMessage({
    token: 'xoxb-test',
    channel: '#alerts',
    text,
    channelId,
    _web: this.web
  }))
})

Then('the message is posted to channel {string}', function (channelId) {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params, 'chat.postMessage called')
  assert.equal(params.channel, channelId)
})

Then('no channel listing happened', function () {
  assert.equal(this.web.__recorder.count('conversations.list'), 0)
})

When('sending a Slack message with text {string} and event type {string}', async function (text, eventType) {
  await this.attempt(() => sendSlackMessage({
    token: 'xoxb-test',
    channel: '#alerts',
    text,
    eventType,
    _web: this.web
  }))
})

Then('the message is posted with metadata event type {string}', function (eventType) {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params, 'chat.postMessage called')
  assert.equal(params.metadata.event_type, eventType)
})

When('converting a markdown message of sixty paragraphs to blocks', async function () {
  this.blocks = await messageToBlocks(
    Array.from({ length: 60 }, (_, i) => `paragraph number ${i + 1}`).join('\n\n')
  )
})

Then('at most fifty blocks are produced', function () {
  assert.ok(this.blocks.length <= 50, `got ${this.blocks.length} blocks`)
  assert.equal(this.blocks.length, 50)
})

Then('the last original block survives the cap', function () {
  const last = this.blocks[this.blocks.length - 1]
  assert.ok(JSON.stringify(last).includes('paragraph number 60'))
})

Then('the cap is announced with {string}', function (marker) {
  assert.ok(
    this.blocks.some(b => JSON.stringify(b).includes(marker)),
    'expected an "...and more" block'
  )
})
