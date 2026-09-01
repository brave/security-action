import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import reconcileNudgeMessages from '../../src/reconcileNudgeMessages.js'
import refreshNudgeThread from '../../src/refreshNudgeThread.js'
import { buildRepoMessage, buildParentBlocks } from '../../src/dependabotNudge.js'
import { messageToBlocks } from '../../src/sendSlackMessage.js'
import { chunkNudgeMessage } from '../../src/slackUtils.js'

const REPO = 'brave/app'
const PARENT_EVENT_TYPE = 'dependabot-nudge-repo-parent'

function makeAlert (n, severity = 'high') {
  return {
    number: n,
    html_url: `https://github.com/${REPO}/security/dependabot/${n}`,
    severity,
    dependency: { package: { name: `pkg-${n}` }, scope: 'runtime' },
    security_advisory: {
      summary: `advisory ${n}`,
      description: `Description of advisory ${n}`,
      severity,
      cve_id: `CVE-2026-00${n}`,
      ghsa_id: `GHSA-00${n}`
    },
    security_vulnerability: { first_patched_version: { identifier: '1.2.3' } }
  }
}

function nextTs (ts) {
  return (parseFloat(ts) + 0.000001).toFixed(6)
}

// Build a realistic nudge thread: parent + one reply per alert
// (+ the cc completion reply), rendered through the same
// builders the posting path uses.
async function buildThreadFixture (world, { threadAlerts, withCc }) {
  const { message, total, critical } = buildRepoMessage({ alerts: threadAlerts })
  const chunks = chunkNudgeMessage(message)
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
  for (const chunk of chunks) {
    ts = nextTs(ts)
    replies.push({
      ts,
      bot_id: 'BNUDGE',
      text: 'dependabot alert',
      blocks: await messageToBlocks(chunk),
      metadata: {
        event_type: 'dependabot-nudge-alerts',
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
        event_type: 'dependabot-nudge-cc',
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
  this.reconcileAlerts = Array.from({ length: count }, (_, i) => makeAlert(i + 1))
})

Given('a completed nudge thread for {string} built from {int} alerts', async function (repo, count) {
  assert.equal(repo, REPO)
  await buildThreadFixture(this, {
    threadAlerts: Array.from({ length: count }, (_, i) => makeAlert(i + 1)),
    withCc: true
  })
})

Given('an incomplete nudge thread for {string} built from {int} alerts', async function (repo, count) {
  assert.equal(repo, REPO)
  await buildThreadFixture(this, {
    threadAlerts: Array.from({ length: count }, (_, i) => makeAlert(i + 1)),
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
