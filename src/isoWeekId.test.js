import assert from 'node:assert'
import { test } from 'node:test'
import isoWeekId from './isoWeekId.js'

test('isoWeekId: regular mid-year date', () => {
  // 2026-07-17 is a Friday in ISO week 29.
  assert.strictEqual(isoWeekId(new Date('2026-07-17')), '2026-W29')
})

test('isoWeekId: Monday starts the week', () => {
  // 2026-07-13 is a Monday, still week 29.
  assert.strictEqual(isoWeekId(new Date('2026-07-13')), '2026-W29')
})

test('isoWeekId: year boundary - late December rolls into next year W01', () => {
  // 2025-12-29 is a Monday and belongs to ISO week 2026-W01.
  assert.strictEqual(isoWeekId(new Date('2025-12-29')), '2026-W01')
})

test('isoWeekId: Jan 1 of non-week-1 year', () => {
  // 2026-01-01 is a Thursday -> ISO week 2026-W01.
  assert.strictEqual(isoWeekId(new Date('2026-01-01')), '2026-W01')
})

test('isoWeekId: Jan 1 belonging to previous year week', () => {
  // 2027-01-01 is a Friday -> ISO week 2026-W53.
  assert.strictEqual(isoWeekId(new Date('2027-01-01')), '2026-W53')
})

test('isoWeekId: Sunday wraps correctly', () => {
  // 2026-07-19 is a Sunday, still week 29.
  assert.strictEqual(isoWeekId(new Date('2026-07-19')), '2026-W29')
})
