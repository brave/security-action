import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import reconcileNudgeMessages from '../../src/reconcileNudgeMessages.js'
import refreshNudgeThread from '../../src/refreshNudgeThread.js'
import { buildRepoMessage, buildParentBlocks } from '../../src/dependabotNudge.js'
import { PARENT_EVENT_TYPE, ALERTS_EVENT_TYPE, CC_EVENT_TYPE } from '../../src/nudgeThread.js'
import { messageToBlocks } from '../../src/sendSlackMessage.js'
import { chunkNudgeMessage } from '../../src/slackUtils.js'

const REPO = 'brave/app'

const makeAlert = (world, n, overrides = {}) =>
  world.makeDependabotAlert(n, { repo: REPO, ...overrides })

function nextTs (ts) {
  return (parseFloat(ts) + 0.000001).toFixed(6)
}

// Build a realistic nudge thread: parent + one reply per chunk
// (+ the cc completion reply), rendered through the same
// builders the posting path uses.
async function buildThreadFixture (world, { threadAlerts, chunks, withCc }) {
  let built
  if (chunks) {
    const total = chunks.length
    built = { chunks, total, critical: 0 }
  } else {
    const { message, total, critical } = buildRepoMessage({ alerts: threadAlerts })
    built = { chunks: chunkNudgeMessage(message), total, critical }
  }
  const { chunks: rendered, total, critical } = built
  const parentTs = '1700000000.000001'

  const parent = {
    ts: parentTs,
    bot_id: 'BNUDGE',
    text: 'dependabot alert',
    // The nudge edits the cc into the parent before posting the
    // cc reply, so even an incomplete thread carries it inline.
    blocks: await buildParentBlocks({
      repo: REPO, total, critical, cc: withCc ? '' : 'cc <@U123>'
    }),
    metadata: {
      event_type: PARENT_EVENT_TYPE,
      event_payload: { org: 'brave', repo: REPO, weekId: '2026-W36' }
    }
  }

  const replies = [parent]
  let ts = parentTs
  for (const chunk of rendered) {
    ts = nextTs(ts)
    replies.push({
      ts,
      bot_id: 'BNUDGE',
      text: 'dependabot alert',
      blocks: await messageToBlocks(chunk),
      metadata: {
        event_type: ALERTS_EVENT_TYPE,
        event_payload: { repo: REPO, kind: 'alerts' }
      }
    })
  }
  if (withCc) {
    ts = nextTs(ts)
    replies.push({
      ts,
      bot_id: 'BNUDGE',
      text: 'cc <@U123>',
      metadata: {
        event_type: CC_EVENT_TYPE,
        event_payload: { repo: REPO, kind: 'cc' }
      }
    })
  }

  world.threadParentTs = parentTs
  world.threadHistory = [parent]
  world.slackWeb = world.makeMockSlackWeb({
    messages: [parent],
    repliesByTs: { [parentTs]: replies }
  })
}

Given('the reconcile runs on {iso-date}', function (date) {
  this.reconcileNow = date
})

Given('the repo {string} has {int} open alerts', function (repo, count) {
  assert.equal(repo, REPO)
  this.reconcileRepo = repo
  this.reconcileAlerts = Array.from({ length: count }, (_, i) => makeAlert(this, i + 1))
})

Given('a completed nudge thread for {string} built from {int} alerts', async function (repo, count) {
  assert.equal(repo, REPO)
  await buildThreadFixture(this, {
    threadAlerts: Array.from({ length: count }, (_, i) => makeAlert(this, i + 1)),
    withCc: true
  })
})

Given('the repo {string} has 2 duplicate-advisory alerts', function (repo) {
  assert.equal(repo, REPO)
  this.reconcileRepo = repo
  this.reconcileAlerts = [1, 2].map(n => makeAlert(this, n, {
    pkg: 'bn.js',
    summary: 'bn.js affected by an infinite loop',
    cveId: 'CVE-2026-2739',
    ghsaId: 'GHSA-abcd-1234'
  }))
})

Given('a legacy nudge thread for {string} with one reply per alert', async function (repo) {
  assert.equal(repo, REPO)
  // Pre-grouping format: one reply per alert, even when two
  // alerts are the same advisory on the same package.
  const chunks = this.reconcileAlerts.map(a =>
    chunkNudgeMessage(buildRepoMessage({ alerts: [a] }).message)[0])
  await buildThreadFixture(this, { chunks, withCc: true })
})

Given('an incomplete nudge thread for {string} built from {int} alerts', async function (repo, count) {
  assert.equal(repo, REPO)
  await buildThreadFixture(this, {
    threadAlerts: Array.from({ length: count }, (_, i) => makeAlert(this, i + 1)),
    withCc: false
  })
})

When('reconciling nudge messages', async function () {
  const refreshCalls = []
  const repo = this.reconcileRepo || REPO
  const listSlackMessageRepos = async () => [repo]
  this.deletedStale = []
  const deleteSlackMessages = async (args) => { this.deletedStale.push(args.repos) }
  this.github = this.github || this.makeMockGithub({
    alertsByRepo: { [repo]: this.reconcileAlerts || [] }
  })
  await this.attempt(() => reconcileNudgeMessages({
    github: this.github,
    slackToken: 'xoxb-test',
    channel: 'C001',
    now: this.reconcileNow,
    listSlackMessageRepos,
    deleteSlackMessages,
    refreshNudgeThread: async (args) => {
      refreshCalls.push(args)
      if (!this.slackWeb) return undefined
      return refreshNudgeThread({
        web: this.slackWeb,
        channelId: 'C001',
        messages: this.threadHistory,
        ...args
      })
    }
  }))
  this.refreshCalls = refreshCalls
})

When('refreshing the nudge thread in notify mode', async function () {
  await this.attempt(() => refreshNudgeThread({
    web: this.slackWeb,
    channelId: 'C001',
    messages: this.threadHistory,
    repoFullName: REPO,
    alerts: this.reconcileAlerts
  }))
})

Then('the reconcile alert severity filter is {string}', function (expected) {
  const paginate = this.github.__recorder.find('paginate')
    .find(call => call.params.url.includes('dependabot/alerts'))
  assert.ok(paginate, 'expected a dependabot alerts paginate call')
  assert.deepEqual(paginate.params.opts.severity, expected.split(','))
})

Then('no replies are posted to the thread', function () {
  const posts = this.slackWeb.__recorder.find('chat.postMessage')
  assert.equal(posts.length, 0,
    `expected no posts, got ${JSON.stringify(posts.map(p => p.params.metadata?.event_payload))}`)
})

Then('the thread has {int} new alert replies', function (count) {
  const posts = this.slackWeb.__recorder.find('chat.postMessage')
    .filter(p => p.params.metadata?.event_payload?.kind === 'alerts')
  assert.equal(posts.length, count)
})

Then('the thread is completed with exactly one cc reply', function () {
  const posts = this.slackWeb.__recorder.find('chat.postMessage')
  assert.equal(posts.length, 1,
    `expected only the cc reply, got ${posts.length} posts`)
  assert.equal(posts[0].params.metadata?.event_payload?.kind, 'cc')
})

Then('the parent shows {int} open Dependabot issues', function (count) {
  assertParentCount(this, count)
})

Then('the parent still shows {int} open Dependabot issues', function (count) {
  assertParentCount(this, count)
})

function assertParentCount (world, count) {
  const updates = world.slackWeb.__recorder.find('chat.update')
    .filter(u => u.params.ts === world.threadParentTs)
  const blocks = updates.length > 0
    ? updates[updates.length - 1].params.blocks
    : world.threadHistory[0].blocks
  const text = blocks.map(b => b.text?.text || '').join('\n')
  assert.match(text, new RegExp(`has \`${count}\` open Dependabot issues`))
}

Then('the stale nudge messages are deleted', function () {
  assert.deepEqual(this.deletedStale, [[REPO]])
})
