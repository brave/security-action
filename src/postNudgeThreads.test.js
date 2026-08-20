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

// Test: a fresh repo gets a parent carrying the cc inline
// (the thread's only notification), then one reply per
// alert, and never a cc reply or a parent edit
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
  const parentText = parentPost.blocks[0].text.text
  assert.ok(
    parentText.includes('open Dependabot issues'),
    'The parent carries the summary'
  )
  assert.ok(
    parentText.endsWith(`(${ccText})`),
    'The parent carries the cc inline: its post is the single notification'
  )

  const chunkPosts = calls.posted.filter(
    p => p.metadata?.event_payload?.kind === 'alerts'
  )
  assert.equal(
    chunkPosts.length, alerts.length,
    'One reply per alert, not one aggregated message'
  )
  for (const post of chunkPosts) {
    assert.equal(
      post.thread_ts, PARENT_TS,
      'Findings belong in the thread'
    )
  }

  assert.ok(
    !calls.posted.some(p => p.metadata?.event_payload?.kind === 'cc'),
    'No duplicate cc reply: the parent already shows it'
  )
  assert.equal(
    calls.updated.length, 0,
    'The parent is complete at post time, no edit needed'
  )
}
console.log('  postNudgeThreads: parent with inline cc, one reply per alert')

// Test: an existing thread is refreshed in place, never
// re-posted or re-pinged
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
  assert.equal(
    calls.posted.filter(p => p.metadata?.event_type === PARENT_EVENT_TYPE).length, 0,
    'Should not post a second parent'
  )
  assert.ok(
    !calls.posted.some(p => p.metadata?.event_payload?.kind === 'cc'),
    'No cc reply is ever posted'
  )
}
console.log('  postNudgeThreads: refreshes an existing thread in place')

// Test: when the refresh reports a failure the thread is
// left as-is so the next run retries it
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
  assert.equal(
    calls.posted.filter(p => p.metadata?.event_type === PARENT_EVENT_TYPE).length, 0,
    'A failed refresh must not fall back to posting a new thread'
  )
}
console.log('  postNudgeThreads: leaves a failed refresh for the next run')

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
        metadata: { event_payload: { repo: 'brave/foo', kind: 'alerts' } }
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
  assert.ok(chunkPosts.length > 0, 'Should still fill in the findings')
  assert.equal(
    chunkPosts[0].thread_ts, PARENT_TS,
    'Findings belong to the adopted thread'
  )
}
console.log('  postNudgeThreads: adopts a parent from a concurrent run')

console.log('\n✅ All postNudgeThreads tests passed!')
