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

Then('the message is posted with body {string}', function (body) {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params, 'chat.postMessage called')
  const rendered = JSON.stringify(params.blocks ?? params.attachments ?? [])
  assert.ok(rendered.includes(body), `posted body missing "${body}"`)
})

Then('the posted body does not contain {string}', function (snippet) {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params, 'chat.postMessage called')
  const rendered = JSON.stringify(params.blocks ?? params.attachments ?? [])
  assert.ok(!rendered.includes(snippet), `posted body unexpectedly contains "${snippet}"`)
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

// --- Long-message overflow into threads ---

const bulletLine = (n) =>
  `- [Alert ${n} in \`repo\`](https://github.com/repo/alert/${n})`
const bulletBody = (count) =>
  Array.from({ length: count }, (_, i) => bulletLine(i + 1)).join('\n')

async function postBullets (world, count, extra = {}) {
  world.lastBody = bulletBody(count)
  await world.attempt(() => sendSlackMessage({
    token: 'xoxb-test',
    channel: '#alerts',
    message: world.lastBody,
    _web: world.web,
    ...extra
  }))
}

When('sending a Slack message with a markdown body of {int} alert bullets', function (count) {
  return postBullets(this, count)
})

When('sending a Slack message with a markdown body of {int} alert bullets into thread {string}', function (count, threadTs) {
  return postBullets(this, count, { threadTs })
})

Given('a Slack channel {string} which already received the same long message today', function (_channel) {
  this.web = webWithHistory.call(this, [
    { ts: '1', metadata: { event_type: sha256(bulletBody(80)) } }
  ])
})

const topLevelPost = function () {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  assert.ok(params, 'chat.postMessage called')
  assert.ok(!params.thread_ts, `expected no thread_ts, got ${params.thread_ts}`)
}

Then('the first post is a top-level message', topLevelPost)
Then('the post is a top-level message', topLevelPost)

Then('the first post announces {int} more in thread', function (count) {
  const params = this.web.__recorder.paramsOf('chat.postMessage')[0]
  const rendered = JSON.stringify(params.blocks)
  assert.ok(
    rendered.includes(`…${count} more in thread`),
    `missing trailer, tail: ${rendered.slice(-200)}`
  )
})

Then("the overflow is posted as a reply in the first post's thread", function () {
  const posts = this.web.__recorder.paramsOf('chat.postMessage')
  assert.ok(posts.length >= 2, 'expected a thread reply after the head post')
  // The mock returns ts '1234.5678' for every post, so the reply must
  // reference the head post's timestamp — not a nested one.
  assert.equal(posts[1].thread_ts, '1234.5678')
})

Then('every posted bullet is intact', function () {
  const posts = this.web.__recorder.paramsOf('chat.postMessage')
  assert.ok(posts.length > 0, 'expected at least one post')
  // mack rewrites "- [label](url)" bullets, so check that both
  // halves of every bullet entity survive: the label and the link.
  const rendered = posts.map(p => JSON.stringify(p.blocks)).join('\n')
  const missing = []
  for (let n = 1; n <= this.lastBody.split('\n').length; n++) {
    if (!rendered.includes(`https://github.com/repo/alert/${n}|Alert ${n} in`)) {
      missing.push(n)
    }
  }
  assert.deepEqual(missing, [], `truncated or missing bullets: ${missing.slice(0, 5).join(', ')}`)
})

Then('exactly one message is posted', function () {
  assert.equal(this.web.__recorder.count('chat.postMessage'), 1)
})

Then('every post after the first stays in thread {string}', function (threadTs) {
  const posts = this.web.__recorder.paramsOf('chat.postMessage')
  assert.ok(posts.length >= 2, 'expected a thread reply after the head post')
  assert.equal(posts[0].thread_ts, threadTs)
  for (const p of posts.slice(1)) {
    assert.equal(p.thread_ts, threadTs, 'reply must stay in the same thread')
  }
})
