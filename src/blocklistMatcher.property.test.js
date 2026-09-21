/**
 * Property tests for blocklistMatcher (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import { parseBlocklist, fnmatchSubstring } from './blocklistMatcher.js'

const literalArb = fc.stringMatching(/^[a-zA-Z0-9_\-./]{1,20}$/)

test('property: metachar-free pattern matches iff the path contains it', () => {
  fc.assert(fc.property(
    literalArb,
    fc.string({ unit: fc.constantFrom(...'ab/._0123456789'.split('')), minLength: 0, maxLength: 30 }),
    (pattern, path) => {
      assert.equal(fnmatchSubstring(pattern, path), path.includes(pattern))
    }
  ), { numRuns: 500 })
})

test('property: arbitrary patterns never throw and match as pure booleans', () => {
  fc.assert(fc.property(
    fc.string({ unit: fc.constantFrom(...'*?[]ab/.\\'.split('')), minLength: 0, maxLength: 12 }),
    fc.string({ unit: fc.constantFrom(...'ab[]*?\\./'.split('')), minLength: 0, maxLength: 40 }),
    (pattern, path) => {
      assert.equal(typeof fnmatchSubstring(pattern, path), 'boolean')
    }
  ), { numRuns: 500 })
})

test('property: parseBlocklist never emits comment, empty or bare-asterisk patterns', () => {
  fc.assert(fc.property(
    fc.array(fc.constantFrom('*', '@', '#c', 't3sts/', '', ' '), { maxLength: 20 }),
    lines => {
      const { patterns, warnings } = parseBlocklist(lines.join('\n'))
      for (const p of patterns) {
        assert.ok(p.length > 0 && !p.startsWith('#'))
        assert.ok(!/^[*@]+$/.test(p))
      }
      assert.equal(
        patterns.length + warnings.length,
        lines.filter(l => l.trim() !== '' && !l.trim().startsWith('#')).length)
    }
  ), { numRuns: 200 })
})
