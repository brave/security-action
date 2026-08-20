/**
 * Tests for slackUtils module
 */
import { strict as assert } from 'assert'
import { findChannelId, fetchMessages, fetchThreadReplies, deleteMessages, chunkNudgeMessage, isBotOwned, createSlackClient, prepareSlackContext, pace } from './slackUtils.js'

// Keep the suite fast: cap every rate-limit delay.
const realSetTimeout = globalThis.setTimeout
globalThis.setTimeout = (fn, ms) => realSetTimeout(fn, Math.min(Number(ms) || 0, 1))

// ---- findChannelId ----

console.log('Testing findChannelId...')

// Test: finds channel on first page
{
  const mockWeb = {
    conversations: {
      list: async () => ({
        channels: [
          { name: 'general', id: 'C001' },
          { name: 'secops-hotspots', id: 'C002' }
        ],
        response_metadata: { next_cursor: '' }
      })
    }
  }
  const id = await findChannelId(mockWeb, '#secops-hotspots')
  assert.equal(id, 'C002', 'Should resolve #secops-hotspots to C002')
}
console.log('  findChannelId: found on first page')

// Test: finds channel without # prefix
{
  const mockWeb = {
    conversations: {
      list: async () => ({
        channels: [{ name: 'secops-hotspots', id: 'C002' }],
        response_metadata: { next_cursor: '' }
      })
    }
  }
  const id = await findChannelId(mockWeb, 'secops-hotspots')
  assert.equal(id, 'C002', 'Should resolve without # prefix')
}
console.log('  findChannelId: found without # prefix')

// Test: paginates to find channel
{
  let callCount = 0
  const mockWeb = {
    conversations: {
      list: async ({ cursor }) => {
        callCount++
        if (!cursor) {
          return {
            channels: [{ name: 'general', id: 'C001' }],
            response_metadata: { next_cursor: 'page2' }
          }
        }
        return {
          channels: [{ name: 'secops-hotspots', id: 'C002' }],
          response_metadata: { next_cursor: '' }
        }
      }
    }
  }
  const id = await findChannelId(mockWeb, '#secops-hotspots')
  assert.equal(id, 'C002', 'Should find after pagination')
  assert.equal(callCount, 2, 'Should have made 2 API calls')
}
console.log('  findChannelId: paginates correctly')

// Test: throws when channel not found
{
  const mockWeb = {
    conversations: {
      list: async () => ({
        channels: [{ name: 'general', id: 'C001' }],
        response_metadata: { next_cursor: '' }
      })
    }
  }
  await assert.rejects(
    () => findChannelId(mockWeb, '#nonexistent'),
    { message: 'channel not found' }
  )
}
console.log('  findChannelId: throws on not found')

// ---- fetchMessages ----

console.log('\nTesting fetchMessages...')

// Test: fetches single page
{
  const mockWeb = {
    conversations: {
      history: async () => ({
        messages: [
          { ts: '1', text: 'hello' },
          { ts: '2', text: 'world' }
        ],
        has_more: false,
        response_metadata: {}
      })
    }
  }
  const msgs = await fetchMessages(mockWeb, 'C001', 7)
  assert.equal(msgs.length, 2, 'Should return 2 messages')
}
console.log('  fetchMessages: single page')

// Test: paginates multiple pages
{
  let callCount = 0
  const mockWeb = {
    conversations: {
      history: async ({ cursor }) => {
        callCount++
        if (!cursor) {
          return {
            messages: [{ ts: '1', text: 'page1' }],
            has_more: true,
            response_metadata: { next_cursor: 'page2' }
          }
        }
        return {
          messages: [{ ts: '2', text: 'page2' }],
          has_more: false,
          response_metadata: {}
        }
      }
    }
  }
  const msgs = await fetchMessages(mockWeb, 'C001', 7)
  assert.equal(msgs.length, 2, 'Should combine both pages')
  assert.equal(callCount, 2, 'Should make 2 API calls')
}
console.log('  fetchMessages: multi-page pagination')

// Test: passes oldest timestamp
{
  let receivedOldest
  const mockWeb = {
    conversations: {
      history: async ({ oldest }) => {
        receivedOldest = oldest
        return {
          messages: [],
          has_more: false,
          response_metadata: {}
        }
      }
    }
  }
  await fetchMessages(mockWeb, 'C001', 3)
  const expectedMin = Date.now() / 1000 - 60 * 60 * 24 * 3 - 5
  const expectedMax = Date.now() / 1000 - 60 * 60 * 24 * 3 + 5
  assert.ok(
    receivedOldest >= expectedMin && receivedOldest <= expectedMax,
    'Should pass correct oldest timestamp for 3 day lookback'
  )
}
console.log('  fetchMessages: correct oldest timestamp')

// Test: passes include_all_metadata: true
{
  let receivedParams
  const mockWeb = {
    conversations: {
      history: async (params) => {
        receivedParams = params
        return {
          messages: [],
          has_more: false,
          response_metadata: {}
        }
      }
    }
  }
  await fetchMessages(mockWeb, 'C001', 7)
  assert.equal(
    receivedParams.include_all_metadata, true,
    'Should request metadata so downstream consumers can read event_payload'
  )
}
console.log('  fetchMessages: requests metadata')

// ---- fetchThreadReplies ----

console.log('\nTesting fetchThreadReplies...')

// Test: thread replies paginate until has_more clears
{
  const pages = [
    {
      messages: [{ ts: '1.1' }, { ts: '1.2' }],
      has_more: true,
      response_metadata: { next_cursor: 'c2' }
    },
    {
      messages: [{ ts: '1.3' }],
      has_more: false,
      response_metadata: {}
    }
  ]
  const seen = []
  const mockWeb = {
    conversations: {
      replies: async (params) => {
        seen.push(params)
        return pages.shift()
      }
    }
  }
  const replies = await fetchThreadReplies(mockWeb, 'C001', '1.0')
  assert.equal(replies.length, 3, 'Should concatenate every page')
  assert.deepEqual(
    seen.map(p => p.cursor), [undefined, 'c2'],
    'Should follow the cursor between pages'
  )
  assert.equal(
    seen[0].include_all_metadata, true,
    'Should request metadata for ownership checks'
  )
  assert.equal(seen[0].ts, '1.0', 'Should query the thread parent')
}
console.log('  fetchThreadReplies: paginates a long thread')

// Test: a single-page thread (no has_more) returns as-is
{
  const mockWeb = {
    conversations: {
      replies: async () => ({ messages: [{ ts: '1.1' }] })
    }
  }
  const replies = await fetchThreadReplies(mockWeb, 'C001', '1.0')
  assert.equal(replies.length, 1, 'Should return the single page')
}
console.log('  fetchThreadReplies: handles a single page')

// ---- isBotOwned ----

console.log('\nTesting isBotOwned...')

assert.equal(
  isBotOwned({ bot_id: 'B001', ts: '1' }), false,
  'Should preserve an untagged bot post without parent identity'
)
assert.equal(
  isBotOwned({ subtype: 'bot_message', ts: '1' }), false,
  'Should preserve an untagged bot_message without parent identity'
)
assert.equal(
  isBotOwned({
    metadata: { event_payload: { kind: 'alerts' } }
  }),
  true,
  'Should treat tagged nudge replies as bot-owned'
)
assert.equal(
  isBotOwned({ ts: '1', user: 'UHUMAN', text: 'looking' }),
  false,
  'Should not treat a human reply as bot-owned'
)
console.log('  isBotOwned: manages only tagged replies without parent identity')

assert.equal(
  isBotOwned({ bot_id: 'BNUDGE' }, 'BNUDGE'), true,
  'Should treat this bot\'s own post as managed'
)
assert.equal(
  isBotOwned({ bot_id: 'BOTHER', subtype: 'bot_message' }, 'BNUDGE'),
  false,
  'Should not treat another integration\'s reply as managed'
)
assert.equal(
  isBotOwned({
    metadata: { event_payload: { kind: 'alerts' } }
  }, 'BNUDGE'),
  false,
  'Without a bot_id a tagged reply cannot be proven ours, so preserve it'
)
assert.equal(
  isBotOwned({ subtype: 'bot_message', metadata: { event_payload: { kind: 'alerts' } } }, 'BNUDGE'),
  false,
  'The owning bot identity is the only proof that counts'
)
console.log('  isBotOwned: compares against the owning bot identity')

// ---- deleteMessages ----

console.log('\nTesting deleteMessages...')

// Test: debug mode returns count without deleting
{
  let deleteCalled = false
  const mockWeb = {
    chat: {
      delete: async () => { deleteCalled = true }
    }
  }
  const msgs = [
    { ts: '1', metadata: { event_payload: { repo: 'org/repo1' } } },
    { ts: '2', metadata: { event_payload: { repo: 'org/repo2' } } }
  ]
  const count = await deleteMessages(mockWeb, 'C001', msgs, true)
  assert.equal(count, 2, 'Debug mode should return count')
  assert.equal(deleteCalled, false, 'Debug mode should not call delete')
}
console.log('  deleteMessages: debug mode skips deletion')

// Test: deletes messages and returns count
{
  const deleted = []
  const mockWeb = {
    chat: {
      delete: async ({ channel, ts }) => { deleted.push({ channel, ts }) }
    }
  }
  const msgs = [{ ts: '1' }]
  const count = await deleteMessages(mockWeb, 'C001', msgs, false)
  assert.equal(count, 1, 'Should delete 1 message')
  assert.deepEqual(deleted, [{ channel: 'C001', ts: '1' }])
}
console.log('  deleteMessages: deletes and returns count')

// Test: handles delete errors gracefully
{
  const mockWeb = {
    chat: {
      delete: async () => { throw new Error('rate_limited') }
    }
  }
  const msgs = [{ ts: '1' }, { ts: '2' }]
  const count = await deleteMessages(mockWeb, 'C001', msgs, false)
  assert.equal(count, 0, 'Should return 0 when all deletes fail')
}
console.log('  deleteMessages: handles errors gracefully')

// Test: a failed reply deletion aborts the thread teardown
// so the parent is not deleted out from under the orphaned
// reply
{
  const deleted = []
  const mockWeb = {
    chat: {
      delete: async ({ ts }) => {
        if (ts === '1.2') throw new Error('rate_limited')
        deleted.push(ts)
      }
    },
    conversations: {
      replies: async ({ ts }) => ({
        messages: [
          { ts, bot_id: 'B001' },
          { ts: '1.1', bot_id: 'B001' },
          { ts: '1.2', bot_id: 'B001' }
        ]
      })
    }
  }
  const count = await deleteMessages(
    mockWeb, 'C001', [{ ts: '1', reply_count: 2, bot_id: 'B001' }], false
  )
  assert.deepEqual(deleted, ['1.1'], 'Should stop at the failed reply')
  assert.ok(
    !deleted.includes('1'),
    'Should keep the parent for the next run to retry'
  )
  assert.equal(count, 1)
}
console.log('  deleteMessages: keeps parent when a reply delete fails')

// Test: a reply from another bot is preserved like a human
// reply, so the parent is not deleted out from under it
{
  const deleted = []
  const mockWeb = {
    chat: {
      delete: async ({ ts }) => { deleted.push(ts) }
    },
    conversations: {
      replies: async ({ ts }) => ({
        messages: [
          { ts, bot_id: 'BNUDGE' },
          { ts: '1.1', bot_id: 'BNUDGE' },
          {
            ts: '1.9',
            bot_id: 'BOTHER',
            subtype: 'bot_message',
            text: 'zapier did this'
          }
        ]
      })
    }
  }
  const count = await deleteMessages(
    mockWeb, 'C001',
    [{ ts: '1', reply_count: 2, bot_id: 'BNUDGE' }],
    false
  )
  assert.deepEqual(deleted, ['1.1'], 'Should delete only this bot\'s reply')
  assert.ok(
    !deleted.includes('1'),
    'Should preserve the parent while another app replied'
  )
  assert.equal(count, 1)
}
console.log('  deleteMessages: preserves parent when another bot replied')

// Test: deletes thread replies before the parent, otherwise
// Slack leaves them behind a "message deleted" placeholder
{
  const deleted = []
  const mockWeb = {
    chat: {
      delete: async ({ ts }) => { deleted.push(ts) }
    },
    conversations: {
      replies: async ({ ts }) => ({
        messages: [
          { ts },
          { ts: '1.1', bot_id: 'B001' },
          { ts: '1.2', bot_id: 'B001' }
        ]
      })
    }
  }
  const msgs = [{ ts: '1', reply_count: 2, bot_id: 'B001' }]
  const count = await deleteMessages(mockWeb, 'C001', msgs, false)
  assert.equal(count, 3, 'Should delete the parent and both replies')
  assert.deepEqual(
    deleted, ['1.1', '1.2', '1'],
    'Should delete replies first, parent last'
  )
}
console.log('  deleteMessages: deletes thread replies with the parent')

// Test: human replies are left in place, and so is the
// parent, so discussion is not orphaned under a placeholder
{
  const deleted = []
  const mockWeb = {
    chat: {
      delete: async ({ ts }) => { deleted.push(ts) }
    },
    conversations: {
      replies: async ({ ts }) => ({
        messages: [
          { ts, bot_id: 'B001' },
          { ts: '1.1', bot_id: 'B001' },
          { ts: '1.2', user: 'UHUMAN', text: 'looking at this' }
        ]
      })
    }
  }
  const count = await deleteMessages(
    mockWeb, 'C001', [{ ts: '1', reply_count: 2, bot_id: 'B001' }], false
  )
  assert.equal(count, 1, 'Should delete the bot reply only')
  assert.deepEqual(deleted, ['1.1'])
  assert.ok(!deleted.includes('1'), 'Should preserve the parent')
  assert.ok(
    !deleted.includes('1.2'),
    'Should not attempt to delete a human reply'
  )
}
console.log('  deleteMessages: preserves parent when a human replied')

// Test: leaves the parent in place when listing replies
// fails, rather than orphaning unknown thread discussion
{
  const deleted = []
  const mockWeb = {
    chat: {
      delete: async ({ ts }) => { deleted.push(ts) }
    },
    conversations: {
      replies: async () => { throw new Error('rate_limited') }
    }
  }
  const count = await deleteMessages(
    mockWeb, 'C001', [{ ts: '1', reply_count: 2, bot_id: 'B001' }], false
  )
  assert.equal(count, 0, 'Should not delete when replies cannot be listed')
  assert.deepEqual(deleted, [])
}
console.log('  deleteMessages: skips a parent when replies lookup fails')

// ---- chunkNudgeMessage ----

console.log('\nTesting chunkNudgeMessage...')

// Build a message shaped like dependabotNudge output:
// a header, one part per alert, and a trailing separator.
function buildNudgeMessage (alertCount) {
  const parts = ['org/repo has alerts']
  for (let i = 1; i <= alertCount; i++) {
    parts.push(`alert ${i}`)
  }
  return parts.join('\n\n---\n\n') + '\n\n---\n\n'
}

// Test: the default is one alert per chunk so each finding
// lands as its own thread reply
{
  const chunks = chunkNudgeMessage(buildNudgeMessage(3))
  assert.equal(
    chunks.length, 4,
    'Header and three alerts are four chunks'
  )
  assert.ok(chunks[0].includes('org/repo has alerts'), 'Should keep the header')
  assert.equal(chunks[1], 'alert 1', 'Each alert is its own chunk')
}
console.log('  chunkNudgeMessage: one alert per chunk by default')

// Test: long message splits and keeps every alert
{
  const chunks = chunkNudgeMessage(buildNudgeMessage(25))
  assert.ok(chunks.length > 1, 'Should split a long message')
  for (let i = 1; i <= 25; i++) {
    assert.ok(
      chunks.some(c => c.includes(`alert ${i}`)),
      `Should keep alert ${i}`
    )
  }
}
console.log('  chunkNudgeMessage: long message splits without loss')

// Test: drops the empty part left by the trailing separator,
// so no chunk renders as a stray divider
{
  const chunks = chunkNudgeMessage(buildNudgeMessage(3))
  assert.ok(
    chunks.every(c => c.trim().length > 0),
    'Should not emit empty chunks'
  )
  assert.equal(
    chunks[chunks.length - 1].endsWith('---'), false,
    'Should not end a chunk with a dangling separator'
  )
}
console.log('  chunkNudgeMessage: drops the trailing empty part')

// Test: honours a custom chunk size
{
  // 1 header + 9 alerts = 10 non-empty parts
  const chunks = chunkNudgeMessage(buildNudgeMessage(9), 2)
  assert.equal(chunks.length, 5, 'Should split 10 parts into 5 chunks of 2')
}
console.log('  chunkNudgeMessage: honours maxAlertsPerMessage')

// ---- createSlackClient / prepareSlackContext / pace ----

console.log('\nTesting createSlackClient, prepareSlackContext, pace...')

// Test: createSlackClient builds a working SDK client
{
  const web = await createSlackClient('xoxb-test')
  assert.equal(
    typeof web.chat.postMessage, 'function',
    'Should expose the Slack chat API'
  )
}
console.log('  createSlackClient: builds an SDK client')

// Test: prepareSlackContext wires client, channel and
// history together in one call
{
  const mockWeb = {
    conversations: {
      list: async () => ({
        channels: [{ name: 'secops-hotspots', id: 'C002' }],
        response_metadata: {}
      }),
      history: async () => ({
        messages: [{ ts: '1' }, { ts: '2' }],
        has_more: false,
        response_metadata: {}
      })
    }
  }
  const ctx = await prepareSlackContext(
    'xoxb-test', '#secops-hotspots', 7, mockWeb
  )
  assert.equal(ctx.web, mockWeb, 'Should reuse the injected client')
  assert.equal(ctx.channelId, 'C002', 'Should resolve the channel')
  assert.equal(ctx.messages.length, 2, 'Should fetch the history')
}
console.log('  prepareSlackContext: returns web, channelId, messages')

// Test: pace hands the requested delay to setTimeout
{
  // Assert on the delay handed to the timer rather than wall-clock
  // timing: libuv truncates loop time to whole ms, so a real-time
  // assertion can flake by up to a millisecond on loaded runners.
  const real = globalThis.setTimeout
  let captured = null
  globalThis.setTimeout = (fn, ms) => {
    captured = ms
    return real(fn, 0)
  }
  await pace(7)
  assert.equal(captured, 7, 'Should request the requested milliseconds')
  await pace()
  assert.equal(captured, 1200, 'Should default to 1200ms')
  globalThis.setTimeout = (fn, ms) => real(fn, Math.min(Number(ms) || 0, 1))
}
console.log('  pace: forwards delay to setTimeout (default 1200ms)')

console.log('\n✅ All slackUtils tests passed!')
