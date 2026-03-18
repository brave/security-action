/**
 * Tests for cleanupSecurityActionMessages helpers
 */
import { strict as assert } from 'assert'
import {
  parseCcUserIds,
  extractPrUrl,
  parsePrUrl,
  extractAssigneesFromThreads,
  checkAllThreadsResolved
} from './cleanupSecurityActionMessages.js'

// ---- parseCcUserIds ----

console.log('Testing parseCcUserIds...')

// Test: extracts multiple user IDs
{
  const text = 'Some alert message /cc <@U123> <@U456>'
  const ids = parseCcUserIds(text)
  assert.deepEqual(ids, ['U123', 'U456'], 'Should extract 2 IDs')
}
console.log('  parseCcUserIds: extracts multiple IDs')

// Test: extracts single user ID
{
  const ids = parseCcUserIds('Message /cc <@UABC>')
  assert.deepEqual(ids, ['UABC'], 'Should extract 1 ID')
}
console.log('  parseCcUserIds: extracts single ID')

// Test: returns empty for no /cc
{
  const ids = parseCcUserIds('No cc here')
  assert.deepEqual(ids, [], 'Should return empty array')
}
console.log('  parseCcUserIds: empty for no /cc')

// Test: returns empty for null/undefined
assert.deepEqual(parseCcUserIds(null), [])
assert.deepEqual(parseCcUserIds(undefined), [])
assert.deepEqual(parseCcUserIds(''), [])
console.log('  parseCcUserIds: handles null/undefined/empty')

// Test: only captures after /cc
{
  const text = '<@UBEFORE> /cc <@UAFTER>'
  const ids = parseCcUserIds(text)
  assert.deepEqual(ids, ['UAFTER'], 'Should only capture after /cc')
}
console.log('  parseCcUserIds: only captures after /cc')

// ---- extractPrUrl ----

console.log('\nTesting extractPrUrl...')

// Test: extracts from text
{
  const msg = {
    text: 'pull-request: https://github.com/brave/brave-core/pull/123'
  }
  assert.equal(
    extractPrUrl(msg),
    'https://github.com/brave/brave-core/pull/123'
  )
}
console.log('  extractPrUrl: from text')

// Test: extracts from blocks
{
  const msg = {
    text: '',
    blocks: [{
      text: {
        text: 'pull-request: https://github.com/org/repo/pull/42'
      }
    }]
  }
  assert.equal(
    extractPrUrl(msg),
    'https://github.com/org/repo/pull/42'
  )
}
console.log('  extractPrUrl: from blocks')

// Test: extracts from attachment blocks
{
  const msg = {
    text: '',
    blocks: [],
    attachments: [{
      blocks: [{
        text: {
          text: 'pull-request: https://github.com/org/repo/pull/99'
        }
      }]
    }]
  }
  assert.equal(
    extractPrUrl(msg),
    'https://github.com/org/repo/pull/99'
  )
}
console.log('  extractPrUrl: from attachments')

// Test: returns null when no PR URL found
{
  const msg = { text: 'no pr url here' }
  assert.equal(extractPrUrl(msg), null)
}
console.log('  extractPrUrl: null when not found')

// Test: handles missing blocks/attachments
{
  const msg = { text: '' }
  assert.equal(extractPrUrl(msg), null)
}
console.log('  extractPrUrl: handles missing blocks')

// ---- parsePrUrl ----

console.log('\nTesting parsePrUrl...')

// Test: parses valid PR URL
{
  const result = parsePrUrl(
    'https://github.com/brave/brave-core/pull/123'
  )
  assert.deepEqual(result, {
    owner: 'brave',
    repo: 'brave-core',
    number: 123
  })
}
console.log('  parsePrUrl: parses valid URL')

// Test: returns null for non-PR URL
assert.equal(parsePrUrl('https://github.com/brave/repo'), null)
console.log('  parsePrUrl: null for non-PR URL')

// Test: returns null for null/undefined
assert.equal(parsePrUrl(null), null)
assert.equal(parsePrUrl(undefined), null)
console.log('  parsePrUrl: null for null/undefined')

// ---- extractAssigneesFromThreads ----

console.log('\nTesting extractAssigneesFromThreads...')

// Test: extracts assignees from Cc pattern
// Real-world format: the body is a single line with
// <br> acting as line break within HTML comment body.
{
  const threads = {
    nodes: [{
      comments: {
        nodes: [{
          author: { login: 'github-actions' },
          body: 'Some finding<br>Cc @alice @bob'
        }]
      }
    }]
  }
  const assignees = extractAssigneesFromThreads(
    threads, ['default-user']
  )
  assert.deepEqual(assignees, ['alice', 'bob'])
}
console.log('  extractAssigneesFromThreads: extracts from Cc')

// Test: falls back to defaults when no Cc found
{
  const threads = {
    nodes: [{
      comments: {
        nodes: [{
          author: { login: 'some-user' },
          body: 'Regular comment'
        }]
      }
    }]
  }
  const assignees = extractAssigneesFromThreads(
    threads, ['fallback']
  )
  assert.deepEqual(assignees, ['fallback'])
}
console.log('  extractAssigneesFromThreads: falls back to defaults')

// Test: deduplicates assignees
{
  const threads = {
    nodes: [
      {
        comments: {
          nodes: [{
            author: { login: 'github-actions' },
            body: 'Finding 1<br>Cc @alice @bob'
          }]
        }
      },
      {
        comments: {
          nodes: [{
            author: { login: 'github-actions' },
            body: 'Finding 2<br>Cc @alice @charlie'
          }]
        }
      }
    ]
  }
  const assignees = extractAssigneesFromThreads(
    threads, []
  )
  assert.ok(assignees.includes('alice'), 'Should include alice')
  assert.ok(assignees.includes('bob'), 'Should include bob')
  assert.ok(assignees.includes('charlie'), 'Should include charlie')
  // Verify no duplicates
  assert.equal(
    assignees.length,
    new Set(assignees).size,
    'Should have no duplicates'
  )
}
console.log('  extractAssigneesFromThreads: deduplicates')

// Test: empty threads falls back to defaults
{
  const threads = { nodes: [] }
  const assignees = extractAssigneesFromThreads(
    threads, ['default1']
  )
  assert.deepEqual(assignees, ['default1'])
}
console.log('  extractAssigneesFromThreads: empty threads')

// ---- checkAllThreadsResolved ----

console.log('\nTesting checkAllThreadsResolved...')

// Test: true when all security threads resolved by assignee
{
  const threads = {
    nodes: [{
      isResolved: true,
      resolvedBy: { login: 'alice' },
      comments: {
        nodes: [{
          author: { login: 'github-actions' },
          body: 'Finding<br>Cc @alice'
        }]
      }
    }]
  }
  assert.equal(
    checkAllThreadsResolved(threads, ['alice']),
    true,
    'Should return true when all resolved by assignee'
  )
}
console.log('  checkAllThreadsResolved: all resolved by assignee')

// Test: false when some threads unresolved
{
  const threads = {
    nodes: [
      {
        isResolved: true,
        resolvedBy: { login: 'alice' },
        comments: {
          nodes: [{
            author: { login: 'github-actions' },
            body: 'Finding 1<br>Cc @alice'
          }]
        }
      },
      {
        isResolved: false,
        resolvedBy: null,
        comments: {
          nodes: [{
            author: { login: 'github-actions' },
            body: 'Finding 2<br>Cc @alice'
          }]
        }
      }
    ]
  }
  assert.equal(
    checkAllThreadsResolved(threads, ['alice']),
    false,
    'Should return false when some unresolved'
  )
}
console.log('  checkAllThreadsResolved: false when unresolved')

// Test: false when resolved by non-assignee
{
  const threads = {
    nodes: [{
      isResolved: true,
      resolvedBy: { login: 'stranger' },
      comments: {
        nodes: [{
          author: { login: 'github-actions' },
          body: 'Finding<br>Cc @alice'
        }]
      }
    }]
  }
  assert.equal(
    checkAllThreadsResolved(threads, ['alice']),
    false,
    'Should return false when resolved by non-assignee'
  )
}
console.log('  checkAllThreadsResolved: false for non-assignee resolver')

// Test: false when no security threads
{
  const threads = {
    nodes: [{
      isResolved: true,
      resolvedBy: { login: 'alice' },
      comments: {
        nodes: [{
          author: { login: 'regular-user' },
          body: 'Normal comment'
        }]
      }
    }]
  }
  assert.equal(
    checkAllThreadsResolved(threads, ['alice']),
    false,
    'Should return false when no security threads'
  )
}
console.log('  checkAllThreadsResolved: false for no security threads')

// Test: case-insensitive login comparison
{
  const threads = {
    nodes: [{
      isResolved: true,
      resolvedBy: { login: 'Alice' },
      comments: {
        nodes: [{
          author: { login: 'github-actions' },
          body: 'Finding<br>Cc @alice'
        }]
      }
    }]
  }
  assert.equal(
    checkAllThreadsResolved(threads, ['alice']),
    true,
    'Should be case-insensitive'
  )
}
console.log('  checkAllThreadsResolved: case-insensitive')

console.log('\n✅ All cleanupSecurityActionMessages tests passed!')
