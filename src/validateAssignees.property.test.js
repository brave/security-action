/**
 * Property tests for assignee sanitization (fast-check).
 *
 * Contract under random HTML/text blobs: every output token is a valid
 * GitHub login, deduplicated and capped — zero invalid logins survive.
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import { sanitizeAssignees, LOGIN_RE, MAX_ASSIGNEES } from './validateAssignees.js'

// HTML fragments as seen in polluted inputs (review comment boilerplate etc.)
const tagArb = fc.constantFrom(
  '<br>', '<br/>', '</a>', '<a href="https://example.com">', '<b>', '</b>',
  '<img src="x.png">', '<!-- Category: security -->', '<sub>x</sub>'
)
const wordArb = fc.string({ minLength: 1, maxLength: 12 }).filter(w => !/\s/.test(w))
const sepArb = fc.constantFrom(' ', '  ', '\n', ',', ', ', ';', '\t')
const blobArb = fc.array(fc.oneof(tagArb, wordArb, sepArb), { maxLength: 60 })
  .map(parts => parts.join(''))

test('property: random HTML/text blobs yield zero invalid logins', async () => {
  await fc.assert(fc.property(blobArb, blob => {
    const valid = sanitizeAssignees(blob)
    assert.ok(valid.length <= MAX_ASSIGNEES)
    for (const login of valid) {
      assert.match(login, LOGIN_RE)
    }
    const lower = valid.map(l => l.toLowerCase())
    assert.equal(new Set(lower).size, lower.length, 'no duplicates')
  }), { numRuns: 2000 })
})

test('property: valid login lists survive unchanged (order + casing)', async () => {
  const loginChar = fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split(''))
  const loginArb = fc.array(loginChar, { minLength: 1, maxLength: 39 })
    .map(chars => chars.join(''))
    // login rules: no leading/trailing hyphen, no double hyphen
    .filter(l => !l.startsWith('-') && !l.endsWith('-') && !l.includes('--'))
  const listArb = fc.array(loginArb, { maxLength: 10 })
    .filter(list => {
      const lower = list.map(l => l.toLowerCase())
      return new Set(lower).size === lower.length
    })

  await fc.assert(fc.property(listArb, list => {
    for (const sep of [' ', ',', '\n', ', ']) {
      assert.deepEqual(sanitizeAssignees(list.join(sep)), list)
    }
  }), { numRuns: 1000 })
})

test('property: sanitizing is idempotent', async () => {
  await fc.assert(fc.property(blobArb, blob => {
    const once = sanitizeAssignees(blob)
    const twice = sanitizeAssignees(once.join('\n'))
    assert.deepEqual(twice, once)
  }), { numRuns: 1000 })
})
