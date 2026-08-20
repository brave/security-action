/**
 * Tests for postNudgeThreads module
 */
import { strict as assert } from 'assert'
import postNudgeThreads from './postNudgeThreads.js'
import { PARENT_EVENT_TYPE } from './refreshNudgeThread.js'
import { buildRepoMessage } from './dependabotNudge.js'

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

const alerts = [makeAlert(1), makeAlert(2), makeAlert(3)]
const { message, total, critical } = buildRepoMessage({ alerts })
const nudges = [{
  repo: 'brave/foo',
  message,
  cc: ccText,
  total,
  critical,
  alerts
}]

const PARENT_TS = '201.0'

function parentMessage (weekId = '2026-W34') {
  return {
    ts: PARENT_TS,
    reply_count: 0,
    username: 'dependabot',
    metadata: {
      event_type: PARENT_EVENT_TYPE,
      event_payload: { org: 'brave', repo: 'brave/foo', weekId }
    }
  }
}

function buildMockWeb ({
  channelMessages = [],
  thread = [],
  updateFail = []
} = {}) {
  const calls = { posted: [], updated: [], sequence: [] }
  const web = {
    chat: {
      postMessage: async (p) => {
        calls.posted.push(p)
        calls.sequence.push(
          `post:${p.metadata?.event_payload?.kind || 'parent'}`
        )
        return { ok: true, ts: p.thread_ts ? '201.1' : PARENT_TS }
      },
      update: async (p) => {
        if (updateFail.includes(p.ts)) throw new Error('update failed')
        calls.updated.push(p)
        calls.sequence.push(`update:${p.ts}`)
        return { ok: true }
      },
      delete: async (p) => ({ ok: true })
    },
    conversations: {
      list: async () => ({
        channels: [{ name: 'secops-hotspots', id: 'C001' }],
        response_metadata: {}
      }),
      history: async () => ({
        messages: channelMessages,
        has_more: false,
        response_metadata: {}
      }),
      replies: async () => ({ messages: thread })
    }
  }
  return { web, calls }
}

function run (web, messages, opts = {}) {
  return postNudgeThreads({
    web,
    channelId: 'C001',
    channel: '#secops-hotspots',
    token: 'xoxb-test',
    messages,
    nudges,
    weekId: '2026-W34',
    debug: false,
    ...opts
  })
}

console.log('Testing postNudgeThreads...')

// Test: a fresh repo gets a parent, findings replies, the
// parent edit, and the cc completion marker last
{
  const { web, calls } = buildMockWeb()
  await run(web, [])

  const parentPost = calls.posted.find(
    p => p.metadata?.event_type === PARENT_EVENT_TYPE
  )
  assert.ok(parentPost, 'Should post a thread parent')
  assert.ok(
    !parentPost.thread_ts,
    'The parent is a top-level message'
  )
  assert.equal(
    parentPost.metadata.event_payload.weekId, '2026-W34',
    'The parent should be tagged with the week'
  )

  const chunkPosts = calls.posted.filter(
    p => p.metadata?.event_payload?.kind === 'alerts'
  )
  assert.equal(chunkPosts.length, 1, 'Should post the findings chunk')
  assert.equal(
    chunkPosts[0].thread_ts, PARENT_TS,
    'Findings belong in the thread'
  )

  const ccPost = calls.posted.find(
    p => p.metadata?.event_payload?.kind === 'cc'
  )
  assert.ok(ccPost, 'Should post the cc reply')
  assert.equal(ccPost.thread_ts, PARENT_TS, 'The cc is a thread reply')
  assert.equal(ccPost.text, ccText, 'The cc is sent as raw text')

  assert.ok(
    calls.updated.some(u => u.ts === PARENT_TS),
    'Should edit the parent with the maintainer line'
  )
  assert.ok(
    calls.sequence.indexOf(`update:${PARENT_TS}`) <
      calls.sequence.indexOf('post:cc'),
    'The parent must be finalized before the cc marker'
  )
  assert.equal(
    calls.sequence[calls.sequence.length - 1], 'post:cc',
    'The cc completion marker is the last write'
  )
}
console.log('  postNudgeThreads: posts parent, chunks, parent edit, cc last')

// Test: a thread whose cc marker already exists is skipped
{
  const parent = { ...parentMessage(), reply_count: 1 }
  const { web, calls } = buildMockWeb({
    channelMessages: [parent],
    thread: [
      parent,
      {
        ts: '201.1',
        text: ccText,
        metadata: { event_payload: { repo: 'brave/foo', kind: 'cc' } }
      }
    ]
  })
  await run(web, [parent])
  assert.equal(calls.posted.length, 0, 'Should not re-post a complete thread')
  assert.equal(calls.updated.length, 0, 'Should not edit a complete thread')
}
console.log('  postNudgeThreads: skips threads completed this week')

// Test: an incomplete thread is refreshed, chunks are not
// re-posted, and the cc lands after the refresh
{
  const parent = { ...parentMessage(), reply_count: 1 }
  const { web, calls } = buildMockWeb({
    channelMessages: [parent],
    thread: [
      parent,
      {
        ts: '201.1',
        metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
      }
    ]
  })
  await run(web, [parent])

  assert.ok(
    !calls.posted.some(p => p.metadata?.event_payload?.kind === 'alerts'),
    'A refreshed thread must not re-post findings chunks'
  )
  const ccPost = calls.posted.find(
    p => p.metadata?.event_payload?.kind === 'cc'
  )
  assert.ok(ccPost, 'Should complete the refreshed thread with the cc')
  assert.equal(
    calls.sequence[calls.sequence.length - 1], 'post:cc',
    'The cc is still the last write'
  )
}
console.log('  postNudgeThreads: completes a refreshed thread')

// Test: when the refresh reports a failure the thread is
// left incomplete so the next run retries it
{
  const parent = { ...parentMessage(), reply_count: 1 }
  const { web, calls } = buildMockWeb({
    channelMessages: [parent],
    thread: [
      parent,
      {
        ts: '201.1',
        metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
      }
    ],
    updateFail: ['201.1']
  })
  await run(web, [parent])

  assert.ok(
    !calls.posted.some(p => p.metadata?.event_payload?.kind === 'cc'),
    'A failed refresh must not be marked complete'
  )
}
console.log('  postNudgeThreads: no cc after a failed refresh')

// Test: a failed parent edit keeps the cc marker away too
{
  const { web, calls } = buildMockWeb({ updateFail: [PARENT_TS] })
  await run(web, [])

  assert.ok(
    calls.posted.some(p => p.metadata?.event_payload?.kind === 'alerts'),
    'Findings are posted before the parent edit'
  )
  assert.ok(
    !calls.posted.some(p => p.metadata?.event_payload?.kind === 'cc'),
    'A failed parent edit must not be marked complete'
  )
}
console.log('  postNudgeThreads: no cc after a failed parent edit')

// Test: a parent from an earlier week does not satisfy the
// current week's nudge
{
  const oldParent = {
    ...parentMessage('2026-W33'),
    ts: '101.0',
    reply_count: 1
  }
  const { web, calls } = buildMockWeb({
    channelMessages: [oldParent],
    thread: [
      oldParent,
      {
        ts: '101.1',
        text: ccText,
        metadata: { event_payload: { repo: 'brave/foo', kind: 'cc' } }
      }
    ]
  })
  await run(web, [oldParent])

  assert.ok(
    calls.posted.some(p => p.metadata?.event_type === PARENT_EVENT_TYPE),
    'A new week needs a new thread'
  )
}
console.log('  postNudgeThreads: posts a new thread for a new week')

// Test: a parent created after our history snapshot (a
// concurrent run) is adopted instead of posting a duplicate
// thread and double-pinging the maintainers
{
  const parent = parentMessage()
  const { web, calls } = buildMockWeb({ channelMessages: [parent] })
  // Stale snapshot: the run started before the parent existed.
  await run(web, [])

  assert.ok(
    !calls.posted.some(p => p.metadata?.event_type === PARENT_EVENT_TYPE),
    'Should not post a second parent for the same week'
  )
  const chunkPosts = calls.posted.filter(
    p => p.metadata?.event_payload?.kind === 'alerts'
  )
  assert.ok(chunkPosts.length > 0, 'Should still post the findings')
  assert.equal(
    chunkPosts[0].thread_ts, PARENT_TS,
    'Findings belong to the adopted thread'
  )
}
console.log('  postNudgeThreads: adopts a parent from a concurrent run')

console.log('\n✅ All postNudgeThreads tests passed!')
