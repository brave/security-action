import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import cleanupSecurityActionMessages, {
  parseCcUserIds,
  extractPrUrl,
  parsePrUrl,
  extractAssigneesFromThreads,
  checkAllThreadsResolved,
  strikethroughText
} from '../../src/cleanupSecurityActionMessages.js'

const PR_URL = 'pull-request: https://github.com/org/repo/pull/42'
const CC_TEXT = 'findings\n/cc <@U123>\n'

// ── parseCcUserIds ──────────────────────────────────────────────

Given('the message text {string}', function (text) {
  this.text = text.replace(/\\n/g, '\n')
})

Then('the cc user ids are {string}', function (ids) {
  const expected = ids ? ids.split(',') : []
  assert.deepEqual(parseCcUserIds(this.text), expected)
})

// ── extractPrUrl / parsePrUrl ──────────────────────────────────

Given('a Slack message whose text, blocks and attachments mention {string}', function (mention) {
  this.msg = {
    text: `before ${mention} after`,
    blocks: [{ text: { text: `block ${mention}` } }],
    attachments: [{ blocks: [{ text: { text: `attach ${mention}` } }] }]
  }
})

Given('a Slack message with no PR link', function () {
  this.msg = { text: 'nothing interesting', blocks: [] }
})

Then('the extracted PR url is {string}', function (url) {
  assert.equal(extractPrUrl(this.msg), url)
})

Then('no PR url is extracted', function () {
  assert.equal(extractPrUrl(this.msg), null)
})

Given('the PR url {string}', function (url) {
  this.parsedPr = parsePrUrl(url)
})

Then('the parsed PR owner is {string}, repo is {string} and number is {int}', function (owner, repo, number) {
  assert.deepEqual(this.parsedPr, { owner, repo, number })
})

Then('no PR is parsed', function () {
  assert.equal(this.parsedPr, null)
})

// ── threads helpers ────────────────────────────────────────────

function ccThread (mentions, resolvedBy) {
  return {
    isResolved: Boolean(resolvedBy),
    resolvedBy: resolvedBy ? { login: resolvedBy } : null,
    comments: {
      nodes: [{
        author: { login: 'github-actions' },
        body: `finding\n<!-- hash -->\n<br>Cc ${mentions}`
      }]
    }
  }
}

Given('review threads with a github-actions Cc comment mentioning {string}', function (mentions) {
  this.threads = { nodes: [ccThread(mentions, null)] }
})

Given('review threads with no github-actions comments', function () {
  this.threads = { nodes: [] }
})

Given('review threads with only human comments', function () {
  this.threads = {
    nodes: [{
      isResolved: false,
      resolvedBy: null,
      comments: { nodes: [{ author: { login: 'someone' }, body: 'looks fine' }] }
    }]
  }
})

Given('review threads with a github-actions Cc comment mentioning {string} resolved by {string}', function (mentions, resolver) {
  this.threads = { nodes: [ccThread(mentions, resolver)] }
})

Given('review threads with a github-actions Cc comment mentioning {string} left unresolved', function (mentions) {
  this.threads = { nodes: [ccThread(mentions, null)] }
})

Given('the linked PR has review threads with a github-actions Cc comment mentioning {string}', function (mentions) {
  this.threads = { nodes: [ccThread(mentions, null)] }
})

Given('the linked PR has review threads with a github-actions Cc comment mentioning {string} resolved by {string}', function (mentions, resolver) {
  this.threads = { nodes: [ccThread(mentions, resolver)] }
})

Given('the linked PR has an unresolved github-actions Cc comment mentioning {string}', function (mentions) {
  this.threads = { nodes: [ccThread(mentions, null)] }
})

Given('the default assignees {string}', function (assignees) {
  this.defaultAssignees = assignees.split(',')
})

Given('the assignees {string}', function (assignees) {
  this.assignees = assignees.split(',')
})

Then('the extracted assignees are {string}', function (expected) {
  assert.deepEqual(
    extractAssigneesFromThreads(this.threads, this.defaultAssignees || []),
    expected.split(',')
  )
})

Then('all security threads are resolved', function () {
  assert.equal(
    checkAllThreadsResolved(this.threads, this.assignees || []),
    true
  )
})

Then('not all security threads are resolved', function () {
  assert.equal(
    checkAllThreadsResolved(this.threads, this.assignees || []),
    false
  )
})

// ── strikethroughText ──────────────────────────────────────────

Then('the strikethrough text is {string}', function (expected) {
  assert.equal(strikethroughText(this.text), expected.replace(/\\n/g, '\n'))
})

// ── main flow ──────────────────────────────────────────────────

function securityActionMessage ({ reactions = [], text = CC_TEXT + PR_URL } = {}) {
  return {
    username: 'security-action',
    ts: '100',
    text,
    reactions
  }
}

Given('a cleanup channel with a security-action message with a checkmark from cc\'d user {string}', function (userId) {
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name: 'secops-hotspots', id: 'C001' }]],
    messages: [securityActionMessage({
      reactions: [{ name: 'white_check_mark', users: [userId] }]
    })]
  })
})

Given('a cleanup channel with a security-action message with a thumbsup from cc\'d user {string}', function (userId) {
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name: 'secops-hotspots', id: 'C001' }]],
    messages: [securityActionMessage({
      reactions: [{ name: 'thumbsup', users: [userId] }]
    })]
  })
})

Given('a cleanup channel with a security-action message with no reactions', function () {
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name: 'secops-hotspots', id: 'C001' }]],
    messages: [securityActionMessage()]
  })
})

Given('a cleanup channel with a security-action message with no PR link and no reactions', function () {
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name: 'secops-hotspots', id: 'C001' }]],
    messages: [securityActionMessage({ text: CC_TEXT })]
  })
})

Given('a cleanup channel with only messages from other users', function () {
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name: 'secops-hotspots', id: 'C001' }]],
    messages: [{ username: 'someone-else', ts: '1', text: 'hello' }]
  })
})

Given('the Slack thread of that message has a reply from cc\'d user {string}', function (userId) {
  this.web = this.makeMockSlackWeb({
    channelPages: [[{ name: 'secops-hotspots', id: 'C001' }]],
    messages: [securityActionMessage()],
    repliesByTs: {
      100: [
        { ts: '100', username: 'security-action' },
        { ts: '101', user: userId }
      ]
    }
  })
})

Given('a GitHub client with the linked PR state', function () {
  this.github = this.makeMockGithub({
    graphqlHandler: (query) => {
      if (query.includes('reviewThreads')) {
        return {
          repository: {
            pullRequest: {
              reviewThreads: this.threads || { nodes: [] }
            }
          }
        }
      }
      return {
        repository: {
          pullRequest: {
            timelineItems: { nodes: this.timeline || [] }
          }
        }
      }
    }
  })
})

Given('a GitHub client where the needs-security-review label was removed by {string}', function (login) {
  this.timeline = [{
    label: { name: 'needs-security-review' },
    actor: { login }
  }]
  this.github = this.makeMockGithub({
    graphqlHandler: (query) => {
      if (query.includes('reviewThreads')) {
        return {
          repository: {
            pullRequest: {
              reviewThreads: this.threads || { nodes: [] }
            }
          }
        }
      }
      return {
        repository: {
          pullRequest: {
            timelineItems: { nodes: this.timeline }
          }
        }
      }
    }
  })
})

Given('a GitHub client where the label is still present', function () {
  this.timeline = []
  this.github = this.makeMockGithub({
    graphqlHandler: (query) => {
      if (query.includes('reviewThreads')) {
        return {
          repository: {
            pullRequest: {
              reviewThreads: this.threads || { nodes: [] }
            }
          }
        }
      }
      return {
        repository: {
          pullRequest: {
            timelineItems: { nodes: [] }
          }
        }
      }
    }
  })
})

Given('a GitHub client that fails every query', function () {
  this.github = this.makeMockGithub({
    graphqlHandler: () => { throw new Error('graphql down') }
  })
})

When('cleanup runs', async function () {
  await this.attempt(() => cleanupSecurityActionMessages({
    token: 'xoxb-test',
    github: this.github,
    channel: '#secops-hotspots',
    defaultAssignees: this.defaultAssignees || ['alice'],
    debug: false,
    _web: this.web
  }))
})

When('cleanup runs with default assignees {string}', async function (assignees) {
  await this.attempt(() => cleanupSecurityActionMessages({
    token: 'xoxb-test',
    github: this.github,
    channel: '#secops-hotspots',
    defaultAssignees: assignees.split(','),
    debug: false,
    _web: this.web
  }))
})

When('cleanup runs in debug mode', async function () {
  await this.attempt(() => cleanupSecurityActionMessages({
    token: 'xoxb-test',
    github: this.github,
    channel: '#secops-hotspots',
    defaultAssignees: this.defaultAssignees || ['alice'],
    debug: true,
    _web: this.web
  }))
})

When('cleanup runs without a token', async function () {
  this.web = this.web || this.makeMockSlackWeb({})
  this.github = this.github || this.makeMockGithub({})
  await this.attempt(() => cleanupSecurityActionMessages({
    github: this.github,
    channel: '#secops-hotspots',
    _web: this.web
  }))
})

When('cleanup runs without a github client', async function () {
  this.web = this.web || this.makeMockSlackWeb({})
  await this.attempt(() => cleanupSecurityActionMessages({
    token: 'xoxb-test',
    channel: '#secops-hotspots',
    _web: this.web
  }))
})

Then('cleanup fails with {string}', function (message) {
  assert.equal(this.error.message, message)
})

Then('no message is struck through', function () {
  assert.equal(this.web.__recorder.count('chat.update'), 0)
})

Then('one message is struck through', function () {
  assert.equal(this.web.__recorder.count('chat.update'), 1)
})

Then('no github query happened', function () {
  assert.equal(this.github.__recorder.count('graphql'), 0)
})

Then('the cleanup reports one affected message', function () {
  assert.equal(this.result, 1)
})
