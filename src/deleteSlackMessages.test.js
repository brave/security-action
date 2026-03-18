/**
 * Tests for deleteSlackMessages module
 */
import { strict as assert } from 'assert'
import { extractRepoFromMessage } from './deleteSlackMessages.js'

// ---- extractRepoFromMessage ----

console.log('Testing extractRepoFromMessage...')

// Test: extracts from metadata event_payload
{
  const msg = {
    metadata: { event_payload: { repo: 'brave/brave-browser' } },
    text: 'some text'
  }
  const repo = extractRepoFromMessage(msg)
  assert.equal(repo, 'brave/brave-browser', 'Should extract from metadata')
}
console.log('  extractRepoFromMessage: from metadata')

// Test: metadata takes precedence over text
{
  const msg = {
    metadata: { event_payload: { repo: 'brave/from-metadata' } },
    text: 'https://github.com/brave/from-text/pull/1'
  }
  const repo = extractRepoFromMessage(msg)
  assert.equal(repo, 'brave/from-metadata', 'Metadata should take precedence')
}
console.log('  extractRepoFromMessage: metadata precedence')

// Test: falls back to github.com URL in text
{
  const msg = {
    text: 'Alert for https://github.com/brave/brave-core/pull/123'
  }
  const repo = extractRepoFromMessage(msg)
  assert.equal(repo, 'brave/brave-core', 'Should extract from URL in text')
}
console.log('  extractRepoFromMessage: from text URL')

// Test: falls back to github.com URL in blocks
{
  const msg = {
    text: '',
    blocks: [{
      text: { text: 'See https://github.com/brave/adblock/issues/5' }
    }]
  }
  const repo = extractRepoFromMessage(msg)
  assert.equal(repo, 'brave/adblock', 'Should extract from blocks')
}
console.log('  extractRepoFromMessage: from blocks')

// Test: falls back to github.com URL in attachments
{
  const msg = {
    text: '',
    blocks: [],
    attachments: [{
      blocks: [{
        text: { text: 'https://github.com/brave/star-core/pull/42' }
      }]
    }]
  }
  const repo = extractRepoFromMessage(msg)
  assert.equal(repo, 'brave/star-core', 'Should extract from attachments')
}
console.log('  extractRepoFromMessage: from attachments')

// Test: returns null for no match
{
  const msg = { text: 'No repo here' }
  const repo = extractRepoFromMessage(msg)
  assert.equal(repo, null, 'Should return null when no repo found')
}
console.log('  extractRepoFromMessage: null for no match')

// Test: returns null for empty metadata
{
  const msg = {
    metadata: { event_payload: {} },
    text: 'No github URL'
  }
  const repo = extractRepoFromMessage(msg)
  assert.equal(repo, null, 'Should return null for empty metadata and no URL')
}
console.log('  extractRepoFromMessage: null for empty metadata')

// Test: handles dots in repo names
{
  const msg = {
    text: 'https://github.com/brave/brave.browser.v2/pull/1'
  }
  const repo = extractRepoFromMessage(msg)
  assert.equal(repo, 'brave/brave.browser.v2', 'Should handle dots in repo names')
}
console.log('  extractRepoFromMessage: handles dots in repo names')

console.log('\n✅ All deleteSlackMessages tests passed!')
