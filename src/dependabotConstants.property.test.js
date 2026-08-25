/**
 * Property tests for dependabotConstants (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import { Severity, nudgeSeverityForToday, severityKeysAbove } from './dependabotConstants.js'

const ORDERED = ['low', 'medium', 'high', 'critical']
const levelArb = fc.constantFrom(...ORDERED)

test('property: keys at or above always include the level itself', async () => {
  await fc.assert(fc.property(levelArb, level => {
    assert.ok(severityKeysAbove(level).includes(level))
  }))
})

test('property: keys at or above form a contiguous suffix of the ordered levels', async () => {
  await fc.assert(fc.property(levelArb, level => {
    const keys = severityKeysAbove(level)
    const expected = ORDERED.slice(ORDERED.indexOf(level))
    assert.deepEqual(keys, expected)
  }))
})

test('property: numeric and string levels agree', async () => {
  await fc.assert(fc.property(levelArb, level => {
    assert.deepEqual(severityKeysAbove(Severity[level]), severityKeysAbove(level))
  }))
})

test('property: severity values strictly increase low -> critical', () => {
  ORDERED.reduce((prev, level) => {
    assert.ok(Severity[level] > prev, `${level} must exceed previous severity`)
    return Severity[level]
  }, -1)
})

test('property: nudge severity is medium exactly within the first 7 days of the month', async () => {
  await fc.assert(fc.property(
    fc.integer({ min: 2000, max: 2100 }),
    fc.integer({ min: 0, max: 11 }),
    fc.integer({ min: 1, max: 28 }),
    (year, month, day) => {
      const date = new Date(year, month, day)
      const severity = nudgeSeverityForToday(date)
      assert.equal(severity, day <= 7 ? 'medium' : 'high')
    }
  ))
})

test('property: nudge severity is always medium or high', async () => {
  await fc.assert(fc.property(
    fc.integer({ min: 2000, max: 2100 }),
    fc.integer({ min: 0, max: 11 }),
    fc.integer({ min: 1, max: 28 }),
    (year, month, day) => {
      assert.ok(['medium', 'high'].includes(nudgeSeverityForToday(new Date(year, month, day))))
    }
  ))
})
