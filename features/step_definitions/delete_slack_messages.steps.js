import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import deleteSlackMessages, {
  extractRepoFromMessage,
  listSlackMessageRepos
} from '../../src/deleteSlackMessages.js'

Given('a Slack message with metadata repo {string}', function (repo) {
  this.msg = { metadata: { event_payload: { repo } } }
})

Given('a Slack message with text {string}', function (text) {
  this.msg = { text }
})

Given('a Slack message with a block linking {string}', function (url) {
  this.msg = { blocks: [{ text: { text: `see ${url} for details` } }] }
})

Then('the extracted repo is {string}', function (repo) {
  assert.equal(extractRepoFromMessage(this.msg), repo)
})

Then('no repo is extracted', function () {
  assert.equal(extractRepoFromMessage(this.msg), null)
})

function botMessage (repo, username = 'github-actions') {
  return {
    username,
    ts: Math.random().toFixed(4),
    metadata: { event_payload: { repo } }
  }
}

Given('a Slack channel with messages from {string} and {string} for repos {string} and {string}', function (userA, userB, repoA, repoB) {
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name: 'alerts', id: 'C001' }]],
    messages: [botMessage(repoA, userA), botMessage(repoB, userB)]
  })
})

Given('a Slack channel with two github-actions messages for repos {string} and {string}', function (repoA, repoB) {
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name: 'alerts', id: 'C001' }]],
    messages: [botMessage(repoA), botMessage(repoB)]
  })
})

When('listing repos for username {string}', async function (username) {
  await this.attempt(() => listSlackMessageRepos({
    token: 'xoxb-test',
    channel: '#alerts',
    username,
    _web: this.web
  }))
})

Then('the repos are {string}', function (repos) {
  const expected = repos.split(',')
  assert.equal(this.result.length, expected.length)
  for (const repo of expected) {
    assert.ok(this.result.includes(repo), `expected ${repo} in ${this.result}`)
  }
})

When('listing repos without a username', async function () {
  await this.attempt(() => listSlackMessageRepos({
    token: 'xoxb-test',
    channel: '#alerts',
    _web: this.web
  }))
})

Then('listing fails with {string}', function (message) {
  assert.equal(this.error.message, message)
})

When('deleting messages for repos {string}', async function (repos) {
  const realSetTimeout = globalThis.setTimeout
  globalThis.setTimeout = (f, ms) => realSetTimeout(f, Math.min(Number(ms) || 0, 1))
  try {
    await this.attempt(() => deleteSlackMessages({
      token: 'xoxb-test',
      channel: '#alerts',
      username: 'github-actions',
      repos: repos.split(','),
      _web: this.web
    }))
  } finally {
    globalThis.setTimeout = realSetTimeout
  }
})

When('deleting messages for no repos', async function () {
  await this.attempt(() => deleteSlackMessages({
    token: 'xoxb-test',
    channel: '#alerts',
    username: 'github-actions',
    repos: [],
    _web: this.web
  }))
})

When('deleting messages for repos {string} and {string} in debug mode', async function (repoA, repoB) {
  await this.attempt(() => deleteSlackMessages({
    token: 'xoxb-test',
    channel: '#alerts',
    username: 'github-actions',
    repos: [repoA, repoB],
    debug: true,
    _web: this.web
  }))
})

When('deleting messages without a token', async function () {
  await this.attempt(() => deleteSlackMessages({
    channel: '#alerts',
    username: 'github-actions',
    repos: ['org/one'],
    _web: this.web
  }))
})

When('deleting messages without a channel', async function () {
  await this.attempt(() => deleteSlackMessages({
    token: 'xoxb-test',
    username: 'github-actions',
    repos: ['org/one'],
    _web: this.web
  }))
})

When('deleting messages without a username', async function () {
  await this.attempt(() => deleteSlackMessages({
    token: 'xoxb-test',
    channel: '#alerts',
    repos: ['org/one'],
    _web: this.web
  }))
})

Then('deleting fails with {string}', function (message) {
  assert.equal(this.error.message, message)
})
