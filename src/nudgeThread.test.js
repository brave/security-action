/**
 * Tests for the shared nudge thread helpers
 */
import { strict as assert } from 'assert'
import {
  findRepoParent,
  postAlertReply,
  PARENT_EVENT_TYPE,
  ALERTS_EVENT_TYPE
} from './nudgeThread.js'

const parentMsg = {
  ts: '100.0',
  metadata: {
    event_type: PARENT_EVENT_TYPE,
    event_payload: { org: 'brave', repo: 'brave/foo', weekId: '2026-W34' }
  }
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

// ---- postAlertReply ----

console.log('\nTesting postAlertReply...')

{
  const calls = []
  const web = {
    chat: {
      postMessage: async (p) => {
        calls.push(p)
        return { ok: true, ts: '101.0' }
      }
    }
  }
  const chunk = '`pkg-1` by `CVE-2026-0001` with a `high` severity *Vulnerability 1*'

  const result = await postAlertReply(
    web, 'C001', '100.0', chunk, 'brave/foo'
  )

  assert.equal(result.ts, '101.0', 'Should return the posted reply')
  assert.equal(calls.length, 1, 'Should post exactly one reply')
  assert.equal(calls[0].channel, 'C001', 'Should target the channel')
  assert.equal(
    calls[0].thread_ts, '100.0',
    'The reply belongs to the parent thread'
  )
  assert.equal(
    calls[0].username, 'dependabot',
    'The reply is posted as the dependabot user'
  )
  assert.equal(
    calls[0].metadata.event_type, ALERTS_EVENT_TYPE,
    'The reply is tagged with the alerts event type'
  )
  assert.equal(
    calls[0].metadata.event_payload.kind, 'alerts',
    'The reply payload is tagged as findings'
  )
  assert.equal(
    calls[0].metadata.event_payload.repo, 'brave/foo',
    'The reply payload carries the repo'
  )
  assert.ok(
    JSON.stringify(calls[0].blocks).includes('pkg-1'),
    'The chunk is rendered as blocks'
  )
}
console.log('  postAlertReply: posts one chunk as an alerts-tagged thread reply')

console.log('\n✅ All nudgeThread tests passed!')
