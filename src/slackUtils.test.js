/**
 * Tests for slackUtils module
 */
import { strict as assert } from 'assert'
import { findChannelId, fetchMessages, deleteMessages } from './slackUtils.js'

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

console.log('\n✅ All slackUtils tests passed!')
