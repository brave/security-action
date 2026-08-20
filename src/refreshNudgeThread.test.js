/**
 * Tests for refreshNudgeThread module
 */
import { strict as assert } from 'assert'
import refreshNudgeThread, { findRepoParent, PARENT_EVENT_TYPE } from './refreshNudgeThread.js'
import {
  buildRepoMessage,
  buildParentBlocks
} from './dependabotNudge.js'
import { messageToBlocks } from './sendSlackMessage.js'
import { chunkNudgeMessage } from './slackUtils.js'

// Keep the suite fast: cap every rate-limit delay.
const realSetTimeout = globalThis.setTimeout
globalThis.setTimeout = (fn, ms) => realSetTimeout(fn, Math.min(Number(ms) || 0, 1))

function makeAlert (n, severity = 'high') {
  return {
    number: n,
    html_url: `https://github.com/brave/foo/security/dependabot/${n}`,
    severity,
    dependency: { package: { name: `pkg-${n}` }, scope: 'runtime' },
    security_advisory: {
      summary: `Vulnerability ${n}`,
      description: `# Title\n\nBad things in pkg-${n}.\n`,
      severity,
      cve_id: `CVE-2026-000${n}`,
      ghsa_id: `GHSA-000${n}`
    },
    security_vulnerability: {
      first_patched_version: { identifier: '1.2.3' }
    }
  }
}

const ccText = 'cc <@U1> <@U2>'

const parentMsg = {
  ts: '100.0',
  username: 'dependabot',
  metadata: {
    event_type: PARENT_EVENT_TYPE,
    event_payload: { org: 'brave', repo: 'brave/foo', weekId: '2026-W34' }
  }
}

// Parent, two detail replies, and the cc reply last.
function threadReplies () {
  return [
    parentMsg,
    {
      ts: '101.0',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    },
    {
      ts: '102.0',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    },
    {
      ts: '103.0',
      text: ccText,
      metadata: { event_payload: { repo: 'brave/foo', kind: 'cc' } }
    }
  ]
}

function buildMockWeb (replies = threadReplies()) {
  const calls = { updated: [], deleted: [], posted: [] }
  const web = {
    chat: {
      update: async (p) => { calls.updated.push(p); return { ok: true } },
      delete: async (p) => { calls.deleted.push(p.ts); return { ok: true } },
      postMessage: async (p) => { calls.posted.push(p); return { ok: true, ts: '999.0' } }
    },
    conversations: {
      replies: async () => ({ messages: replies })
    }
  }
  return { web, calls }
}

function parentSummary (update) {
  return JSON.stringify(update.blocks)
}

// ---- findRepoParent ----

console.log('Testing findRepoParent...')

{
  const messages = [
    parentMsg,
    {
      ts: '200.0',
      metadata: {
        event_type: PARENT_EVENT_TYPE,
        event_payload: { repo: 'brave/bar' }
      }
    }
  ]
  assert.equal(
    findRepoParent(messages, 'brave/foo')?.ts, '100.0',
    'Should find the parent for the requested repo'
  )
  assert.equal(
    findRepoParent(messages, 'brave/nope'), undefined,
    'Should return undefined when the repo has no thread'
  )
}
console.log('  findRepoParent: matches on repo metadata')

{
  const messages = [
    parentMsg,
    {
      ts: '300.0',
      metadata: {
        event_type: PARENT_EVENT_TYPE,
        event_payload: { repo: 'brave/foo' }
      }
    }
  ]
  assert.equal(
    findRepoParent(messages, 'brave/foo').ts, '300.0',
    'Should prefer the newest parent'
  )
}
console.log('  findRepoParent: prefers the newest thread')

{
  const messages = [
    parentMsg,
    {
      ts: '50.0',
      metadata: {
        event_type: PARENT_EVENT_TYPE,
        event_payload: { repo: 'brave/foo', weekId: '2026-W33' }
      }
    }
  ]
  assert.equal(
    findRepoParent(messages, 'brave/foo', '2026-W33')?.ts, '50.0',
    'Should match the requested week'
  )
  assert.equal(
    findRepoParent(messages, 'brave/foo', '2026-W99'), undefined,
    'Should not match another week'
  )
  assert.equal(
    findRepoParent(messages, 'brave/foo')?.ts, '100.0',
    'Without a weekId the newest parent still matches'
  )
}
console.log('  findRepoParent: filters by weekId when given')

// ---- refreshNudgeThread ----

console.log('\nTesting refreshNudgeThread...')

// Test: resolved alerts disappear and the count is corrected
{
  const { web, calls } = buildMockWeb()
  // 12 alerts became 3, so 2 detail replies become 1.
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1), makeAlert(2), makeAlert(3)]
  })

  const parentUpdate = calls.updated.find(u => u.ts === '100.0')
  assert.ok(parentUpdate, 'Should update the thread parent')
  const summary = parentSummary(parentUpdate)
  assert.ok(
    summary.includes('`3` open Dependabot issues'),
    'Should correct the alert count on the parent'
  )
  assert.ok(
    !summary.includes('pkg-'),
    'The parent is a summary only, findings live in the replies'
  )
  assert.ok(
    summary.includes(ccText),
    'Should copy maintainers onto the parent for channel overview'
  )

  const detailUpdate = calls.updated.find(u => u.ts === '101.0')
  assert.ok(detailUpdate, 'Should rewrite the first detail reply')
  const body = JSON.stringify(detailUpdate.blocks)
  assert.ok(body.includes('pkg-1'), 'Should keep remaining alerts')
  assert.ok(!body.includes('pkg-9'), 'Should not mention resolved alerts')

  assert.deepEqual(
    calls.deleted, ['102.0'],
    'Should delete the detail reply that is no longer needed'
  )
  assert.ok(
    !calls.deleted.includes('103.0'),
    'Should never delete the cc reply while alerts remain'
  )
  assert.ok(
    !calls.updated.some(u => u.ts === '103.0'),
    'Should never rewrite the cc reply (it holds the mentions)'
  )
}
console.log('  refreshNudgeThread: drops resolved alerts and fixes the count')

// Test: critical count is reflected on the parent
{
  const { web, calls } = buildMockWeb()
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1, 'critical'), makeAlert(2)]
  })
  const parentUpdate = calls.updated.find(u => u.ts === '100.0')
  assert.ok(
    parentSummary(parentUpdate).includes('(*1 critical*)'),
    'Should report the remaining critical count'
  )
}
console.log('  refreshNudgeThread: reports remaining criticals')

// Test: no critical count when none are left
{
  const { web, calls } = buildMockWeb()
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1)]
  })
  const parentUpdate = calls.updated.find(u => u.ts === '100.0')
  const summary = parentSummary(parentUpdate)
  assert.ok(
    summary.includes('`1` open Dependabot issues'),
    'Should report the remaining alert count'
  )
  assert.ok(
    !summary.includes('critical'),
    'Should omit the critical count when none remain'
  )
}
console.log('  refreshNudgeThread: omits criticals when none are left')

// Test: new alerts are appended rather than hidden
{
  const { web, calls } = buildMockWeb([
    parentMsg,
    {
      ts: '101.0',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    },
    {
      ts: '103.0',
      text: ccText,
      metadata: { event_payload: { repo: 'brave/foo', kind: 'cc' } }
    }
  ])
  const alerts = [...Array(25)].map((_, i) => makeAlert(i + 1))
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts
  })
  assert.ok(
    calls.posted.length > 0,
    'Should append replies when there are more chunks than replies'
  )
  assert.equal(
    calls.posted[0].thread_ts, '100.0',
    'Appended replies must stay in the thread'
  )
  assert.equal(
    calls.posted[0].metadata.event_payload.kind, 'alerts',
    'Appended replies must be tagged as findings, not a parent'
  )
}
console.log('  refreshNudgeThread: appends when alerts grew')

// Test: no thread for the repo is a no-op
{
  const { web, calls } = buildMockWeb()
  const { touched, ok } = await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1)]
  })
  assert.equal(touched, 0, 'Should do nothing without a thread')
  assert.equal(ok, true, 'A no-op is not a failure')
  assert.equal(calls.updated.length, 0)
  assert.equal(calls.deleted.length, 0)
}
console.log('  refreshNudgeThread: no-op without a thread')

// Test: debug mode reports without touching Slack
{
  const { web, calls } = buildMockWeb()
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1)],
    debug: true
  })
  assert.equal(calls.updated.length, 0, 'Debug should not update')
  assert.equal(calls.deleted.length, 0, 'Debug should not delete')
}
console.log('  refreshNudgeThread: debug mode is read-only')

// Test: an already-accurate thread is left untouched, so
// routine runs don't rewrite every message
{
  const alerts = [makeAlert(1)]
  const { message, total, critical } = buildRepoMessage({ alerts })
  const chunks = chunkNudgeMessage(message)

  const accurateParent = {
    ...parentMsg,
    blocks: await buildParentBlocks({
      repo: 'brave/foo', total, critical, cc: ccText
    })
  }

  const { web, calls } = buildMockWeb([
    accurateParent,
    {
      ts: '101.0',
      blocks: await messageToBlocks(chunks[0]),
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    },
    {
      ts: '103.0',
      text: ccText,
      metadata: { event_payload: { repo: 'brave/foo', kind: 'cc' } }
    }
  ])

  const touched = (await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [accurateParent],
    repoFullName: 'brave/foo',
    alerts
  })).touched

  assert.equal(touched, 0, 'Should not touch an up-to-date thread')
  assert.equal(calls.updated.length, 0, 'Should issue no updates')
  assert.equal(calls.deleted.length, 0, 'Should issue no deletes')
}
console.log('  refreshNudgeThread: skips an up-to-date thread')

// Test: a missing cc reply must not strip the existing parent
// mentions before postNudgeThreads retries the reply.
{
  const parent = {
    ...parentMsg,
    blocks: await buildParentBlocks({
      repo: 'brave/foo', total: 2, critical: 0, cc: ccText
    })
  }
  const { web, calls } = buildMockWeb([
    parent,
    {
      ts: '101.0',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    }
  ])
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parent],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1)]
  })
  const parentUpdate = calls.updated.find(u => u.ts === parent.ts)
  assert.ok(
    parentSummary(parentUpdate).includes(ccText),
    'Should preserve parent mentions when the cc reply is missing'
  )
}
console.log('  refreshNudgeThread: preserves parent cc pending reply retry')

// Test: threads written before the inline-cc format carry the
// mentions in a standalone section block; refresh must still
// extract and preserve them.
{
  const legacyParent = {
    ...parentMsg,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: '[brave/foo](https://github.com/brave/foo) has `2` open Dependabot issues' } },
      { type: 'section', text: { type: 'mrkdwn', text: ccText } }
    ]
  }
  const { web, calls } = buildMockWeb([
    legacyParent,
    {
      ts: '101.0',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    }
  ])
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [legacyParent],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1)]
  })
  const parentUpdate = calls.updated.find(u => u.ts === legacyParent.ts)
  assert.ok(
    parentSummary(parentUpdate).includes(ccText),
    'Should preserve legacy-format parent mentions'
  )
}
console.log('  refreshNudgeThread: preserves legacy parent cc')

// Test: zero remaining alerts deletes the thread, replies
// first so Slack does not leave placeholders
{
  const { web, calls } = buildMockWeb()
  const { touched, ok } = await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: []
  })
  assert.ok(touched >= 4, 'Should delete parent, findings, and cc')
  assert.equal(ok, true, 'A fully deleted thread is a success')
  assert.deepEqual(
    calls.deleted,
    ['101.0', '102.0', '103.0', '100.0'],
    'Should delete replies first, parent last'
  )
  assert.equal(calls.updated.length, 0, 'Should not rewrite a doomed thread')
}
console.log('  refreshNudgeThread: deletes the thread when no alerts remain')

// Test: human replies in the thread are not rewritten or
// deleted just because they sit next to findings
{
  const { web, calls } = buildMockWeb([
    parentMsg,
    {
      ts: '101.0',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    },
    {
      ts: '150.0',
      text: 'looking at this',
      user: 'UHUMAN'
    },
    {
      ts: '103.0',
      text: ccText,
      metadata: { event_payload: { repo: 'brave/foo', kind: 'cc' } }
    }
  ])
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1)]
  })
  assert.ok(
    !calls.deleted.includes('150.0'),
    'Should not delete a human reply'
  )
  assert.ok(
    !calls.updated.some(u => u.ts === '150.0'),
    'Should not rewrite a human reply'
  )
}
console.log('  refreshNudgeThread: leaves human replies alone')

// Test: zero remaining alerts with a human reply keeps the
// parent (and the discussion) instead of orphaning it
{
  const { web, calls } = buildMockWeb([
    parentMsg,
    {
      ts: '101.0',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    },
    {
      ts: '150.0',
      text: 'looking at this',
      user: 'UHUMAN'
    },
    {
      ts: '103.0',
      text: ccText,
      metadata: { event_payload: { repo: 'brave/foo', kind: 'cc' } }
    }
  ])
  const { touched, ok } = await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: []
  })
  assert.ok(touched >= 3, 'Should clear bot findings and update the parent')
  assert.equal(ok, true, 'Clearing findings is a success when writes pass')
  assert.deepEqual(
    calls.deleted.sort(),
    ['101.0', '103.0'],
    'Should delete bot replies only'
  )
  assert.ok(
    !calls.deleted.includes('150.0'),
    'Should not attempt to delete a human reply'
  )
  assert.ok(
    !calls.deleted.includes('100.0'),
    'Should preserve the parent while discussion remains'
  )
  const parentUpdate = calls.updated.find(u => u.ts === '100.0')
  assert.ok(parentUpdate, 'Should mark the parent as resolved')
  assert.ok(
    parentSummary(parentUpdate).includes('`0` open Dependabot issues'),
    'Should correct the parent count to zero'
  )
}
console.log('  refreshNudgeThread: preserves parent when a human replied')

// Test: a failed reply deletion aborts the thread teardown,
// so the reply is not orphaned behind a deleted parent
{
  const deleted = []
  const web = {
    chat: {
      delete: async ({ ts }) => {
        if (ts === '102.0') throw new Error('rate_limited')
        deleted.push(ts)
        return { ok: true }
      },
      update: async () => ({ ok: true })
    },
    conversations: {
      replies: async () => ({ messages: threadReplies() })
    }
  }
  const { touched, ok } = await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: []
  })
  assert.equal(ok, false, 'Failed reply delete must be reported')
  assert.deepEqual(
    deleted, ['101.0'],
    'Should stop deleting at the failure'
  )
  assert.ok(
    !deleted.includes('100.0'),
    'Parent must stay so the thread can be retried'
  )
  assert.equal(touched, 1)
}
console.log('  refreshNudgeThread: aborts teardown when a reply delete fails')

// Test: a failed write is reported so the caller does not
// mark the thread complete on top of stale content
{
  const { web, calls } = buildMockWeb()
  web.chat.update = async (p) => {
    if (p.ts === '101.0') throw new Error('rate_limited')
    calls.updated.push(p)
    return { ok: true }
  }
  const { ok } = await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: [makeAlert(1)]
  })
  assert.equal(ok, false, 'Failed detail update must be reported')
}
console.log('  refreshNudgeThread: reports failed writes')

// Test: a reply from another integration is preserved like
// a human reply when the thread is torn down
{
  const parent = { ...parentMsg, bot_id: 'BNUDGE' }
  const replies = [
    parent,
    {
      ts: '101.0',
      bot_id: 'BNUDGE',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    },
    {
      ts: '150.0',
      bot_id: 'BOTHER',
      subtype: 'bot_message',
      text: 'zapier did this'
    },
    {
      ts: '103.0',
      bot_id: 'BNUDGE',
      text: ccText,
      metadata: { event_payload: { repo: 'brave/foo', kind: 'cc' } }
    }
  ]
  const { web, calls } = buildMockWeb(replies)
  const { ok } = await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parent],
    repoFullName: 'brave/foo',
    alerts: []
  })
  assert.deepEqual(
    calls.deleted.sort(), ['101.0', '103.0'],
    'Should delete only this bot\'s replies'
  )
  assert.ok(
    !calls.deleted.includes('150.0'),
    'Should not attempt to delete another integration\'s reply'
  )
  assert.ok(
    !calls.deleted.includes('100.0'),
    'Should preserve the parent while another app replied'
  )
  assert.equal(ok, true)
}
console.log('  refreshNudgeThread: preserves parents with other-bot replies')

// Test: without a parent bot_id, only tagged nudge replies
// are safe to manage; another app's untagged reply must stay.
{
  const replies = [
    parentMsg,
    {
      ts: '101.0',
      metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
    },
    {
      ts: '150.0',
      bot_id: 'BOTHER',
      subtype: 'bot_message',
      text: 'zapier did this'
    }
  ]
  const { web, calls } = buildMockWeb(replies)
  await refreshNudgeThread({
    web,
    channelId: 'C001',
    messages: [parentMsg],
    repoFullName: 'brave/foo',
    alerts: []
  })
  assert.deepEqual(
    calls.deleted, ['101.0'],
    'Should delete only the tagged nudge reply'
  )
  assert.ok(
    !calls.deleted.includes('150.0'),
    'Should preserve an untagged reply from another integration'
  )
  assert.ok(
    !calls.deleted.includes(parentMsg.ts),
    'Should preserve the parent while another app replied'
  )
}
console.log('  refreshNudgeThread: preserves other bots without parent bot_id')

console.log('\n✅ All refreshNudgeThread tests passed!')
