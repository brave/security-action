/**
 * Tests for securityReviewCompleted module
 */

import { strict as assert } from 'assert'
import securityReviewCompleted from './securityReviewCompleted.js'

console.log('Testing securityReviewCompleted...')

// Test 1: Returns false for non-pull_request events
console.log('\nTest 1: Returns false for non-pull_request events')

const result1 = await securityReviewCompleted({
  context: {
    eventName: 'push',
    payload: {}
  },
  github: {},
  assignees: 'user1 user2'
})

assert.equal(result1, false, 'Should return false for push events')
console.log('✓ Returns false for non-pull_request events')

// Test 2: Returns false for non-unlabeled actions
console.log('\nTest 2: Returns false for non-unlabeled actions')

const result2 = await securityReviewCompleted({
  context: {
    eventName: 'pull_request',
    payload: {
      action: 'opened',
      label: { name: 'needs-security-review' },
      sender: { login: 'user1' }
    }
  },
  github: {},
  assignees: 'user1 user2'
})

assert.equal(result2, false, 'Should return false for opened action')
console.log('✓ Returns false for non-unlabeled actions')

// Test 3: Returns false for wrong label
console.log('\nTest 3: Returns false for wrong label')

const result3 = await securityReviewCompleted({
  context: {
    eventName: 'pull_request',
    payload: {
      action: 'unlabeled',
      label: { name: 'bug' },
      sender: { login: 'user1' }
    }
  },
  github: {},
  assignees: 'user1 user2'
})

assert.equal(result3, false, 'Should return false for wrong label')
console.log('✓ Returns false for wrong label')

// Test 4: Returns false if actor is not an assignee
console.log('\nTest 4: Returns false if actor is not an assignee')

const result4 = await securityReviewCompleted({
  context: {
    eventName: 'pull_request',
    payload: {
      action: 'unlabeled',
      label: { name: 'needs-security-review' },
      sender: { login: 'random-user' }
    }
  },
  github: {},
  assignees: 'user1 user2'
})

assert.equal(result4, false, 'Should return false if actor is not an assignee')
console.log('✓ Returns false if actor is not an assignee')

// Test 5: Returns true when label removed by assignee
console.log('\nTest 5: Returns true when label removed by assignee')

const result5 = await securityReviewCompleted({
  context: {
    eventName: 'pull_request',
    payload: {
      action: 'unlabeled',
      label: { name: 'needs-security-review' },
      sender: { login: 'user1' }
    }
  },
  github: {},
  assignees: 'user1 user2'
})

assert.equal(
  result5,
  true,
  'Should return true when label removed by assignee'
)
console.log('✓ Returns true when label removed by assignee')

// Test 6: Case insensitive matching
console.log('\nTest 6: Case insensitive matching')

const result6 = await securityReviewCompleted({
  context: {
    eventName: 'pull_request',
    payload: {
      action: 'unlabeled',
      label: { name: 'needs-security-review' },
      sender: { login: 'User1' }
    }
  },
  github: {},
  assignees: 'user1 user2'
})

assert.equal(result6, true, 'Should match case-insensitively')
console.log('✓ Case insensitive matching works')

// Test 7: Handles missing sender gracefully
console.log('\nTest 7: Handles missing sender gracefully')

const result7 = await securityReviewCompleted({
  context: {
    eventName: 'pull_request',
    payload: {
      action: 'unlabeled',
      label: { name: 'needs-security-review' },
      sender: null
    }
  },
  github: {},
  assignees: 'user1 user2'
})

assert.equal(result7, false, 'Should return false when sender is missing')
console.log('✓ Handles missing sender gracefully')

console.log('\n✅ All securityReviewCompleted tests passed!')
