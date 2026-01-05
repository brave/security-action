/**
 * Tests for sendSlackMessage module - threading functionality
 */

import { strict as assert } from 'assert'
import sendSlackMessage, {
  findExistingThreadForPR,
  addCompletionReaction
} from './sendSlackMessage.js'

// We need to test the helper functions, so we'll need to export them
// For now, test the main function behavior with mocked Slack client

console.log('Testing sendSlackMessage threading functionality...')

// Mock Slack WebClient
function createMockWebClient (options = {}) {
  const {
    channels = [{ id: 'C123', name: 'secops-hotspots' }],
    messages = [],
    postMessageResult = { ok: true, ts: '1234567890.123456' },
    reactionsAddResult = { ok: true }
  } = options

  return {
    conversations: {
      list: async ({ cursor }) => ({
        channels,
        response_metadata: { next_cursor: null }
      }),
      history: async ({ channel, limit, oldest }) => ({
        messages
      })
    },
    chat: {
      postMessage: async (opts) => {
        // Store the call for assertions
        createMockWebClient.lastPostMessageCall = opts
        return postMessageResult
      }
    },
    reactions: {
      add: async (opts) => {
        createMockWebClient.lastReactionsAddCall = opts
        return reactionsAddResult
      }
    }
  }
}

// Test 1: findExistingThreadForPR should return null when no matching thread exists
console.log(
  '\nTest 1: findExistingThreadForPR returns null when no matching thread'
)

const mockWeb1 = createMockWebClient({
  messages: [
    { ts: '111', text: 'random message' },
    { ts: '222', metadata: { event_type: 'other_type', event_payload: {} } }
  ]
})

const result1 = await findExistingThreadForPR(
  mockWeb1,
  'C123',
  'brave/test-repo#42'
)
assert.equal(
  result1,
  null,
  'Should return null when no matching thread exists'
)
console.log('✓ Returns null when no matching thread')

// Test 2: findExistingThreadForPR should return thread ts when matching thread exists
console.log(
  '\nTest 2: findExistingThreadForPR returns ts when matching thread exists'
)

const mockWeb2 = createMockWebClient({
  messages: [
    { ts: '111', text: 'random message' },
    {
      ts: '222',
      metadata: {
        event_type: 'security_action_thread',
        event_payload: { pr_identifier: 'brave/test-repo#42' }
      }
    },
    { ts: '333', text: 'another message' }
  ]
})

const result2 = await findExistingThreadForPR(
  mockWeb2,
  'C123',
  'brave/test-repo#42'
)
assert.equal(result2, '222', 'Should return the ts of the matching thread')
console.log('✓ Returns correct ts when matching thread exists')

// Test 3: findExistingThreadForPR should not match different PR identifiers
console.log(
  '\nTest 3: findExistingThreadForPR does not match different PR identifiers'
)

const mockWeb3 = createMockWebClient({
  messages: [
    {
      ts: '222',
      metadata: {
        event_type: 'security_action_thread',
        event_payload: { pr_identifier: 'brave/other-repo#99' }
      }
    }
  ]
})

const result3 = await findExistingThreadForPR(
  mockWeb3,
  'C123',
  'brave/test-repo#42'
)
assert.equal(
  result3,
  null,
  'Should return null when PR identifier does not match'
)
console.log('✓ Does not match different PR identifiers')

console.log('\n✅ All findExistingThreadForPR tests passed!')

// Test 4: sendSlackMessage should accept prIdentifier and isCompletion parameters
console.log('\nTest 4: sendSlackMessage accepts threading parameters')

// Check that the function exists and is callable
assert.equal(
  typeof sendSlackMessage,
  'function',
  'sendSlackMessage should be a function'
)
console.log('✓ sendSlackMessage is a function')

// We can't easily test the full function without real Slack credentials,
// but we can verify it throws the expected error for missing token with new params
try {
  await sendSlackMessage({
    text: 'test',
    channel: '#test',
    prIdentifier: 'brave/test#1',
    isCompletion: false
  })
  assert.fail('Should have thrown an error for missing token')
} catch (e) {
  assert.equal(
    e.message,
    'token is required!',
    'Should throw token required error'
  )
  console.log(
    '✓ sendSlackMessage accepts prIdentifier and isCompletion without error'
  )
}

console.log('\n✅ All sendSlackMessage parameter tests passed!')

// Test 5: addCompletionReaction should add white_check_mark emoji
console.log('\nTest 5: addCompletionReaction adds checkmark emoji')

const mockWeb5 = createMockWebClient()
createMockWebClient.lastReactionsAddCall = null

const result5 = await addCompletionReaction(
  mockWeb5,
  'C123',
  '1234567890.123456'
)
assert.equal(result5, true, 'Should return true on success')
assert.deepEqual(
  createMockWebClient.lastReactionsAddCall,
  {
    channel: 'C123',
    timestamp: '1234567890.123456',
    name: 'white_check_mark'
  },
  'Should call reactions.add with correct parameters'
)
console.log('✓ addCompletionReaction calls Slack API correctly')

// Test 6: addCompletionReaction should handle already_reacted error gracefully
console.log('\nTest 6: addCompletionReaction handles already_reacted error')

const mockWeb6 = {
  reactions: {
    add: async () => {
      const error = new Error('already_reacted')
      error.data = { error: 'already_reacted' }
      throw error
    }
  }
}

const result6 = await addCompletionReaction(
  mockWeb6,
  'C123',
  '1234567890.123456'
)
assert.equal(result6, true, 'Should return true even if already reacted')
console.log('✓ addCompletionReaction handles already_reacted gracefully')

// Test 7: addCompletionReaction should throw on other errors
console.log('\nTest 7: addCompletionReaction throws on other errors')

const mockWeb7 = {
  reactions: {
    add: async () => {
      const error = new Error('channel_not_found')
      error.data = { error: 'channel_not_found' }
      throw error
    }
  }
}

try {
  await addCompletionReaction(mockWeb7, 'C123', '1234567890.123456')
  assert.fail('Should have thrown an error')
} catch (e) {
  assert.equal(
    e.message,
    'channel_not_found',
    'Should throw the original error'
  )
  console.log('✓ addCompletionReaction throws on other errors')
}

console.log('\n✅ All addCompletionReaction tests passed!')
