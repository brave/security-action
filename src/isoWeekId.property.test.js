/**
 * Property tests for isoWeekId (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import isoWeekId from './isoWeekId.js'

const WEEK_ID_RE = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/

// Arbitrary valid UTC date (year 1970..2100)
const utcDateArb = fc.integer({ min: 1970, max: 2100 }).chain(year =>
  fc.integer({ min: 0, max: 11 }).chain(month =>
    fc.integer({ min: 1, max: 28 }).map(day =>
      new Date(Date.UTC(year, month, day))
    )
  )
)

test('property: week id is always well-formed', async () => {
  await fc.assert(fc.asyncProperty(utcDateArb, date => {
    assert.match(isoWeekId(date), WEEK_ID_RE)
  }))
})

test('property: January 1st is in week 1 exactly when it falls Mon-Thu', async () => {
  await fc.assert(fc.asyncProperty(fc.integer({ min: 1900, max: 2200 }), year => {
    const jan1 = new Date(Date.UTC(year, 0, 1))
    const id = isoWeekId(jan1)
    const weekday = jan1.getUTCDay() // 0=Sun..6=Sat
    const inWeekOne = weekday >= 1 && weekday <= 4
    assert.equal(
      id === `${year}-W01`,
      inWeekOne,
      `${year}-01-01 (weekday ${weekday}): ${id}`
    )
  }))
})

test('property: December 31st belongs to next year week 1 exactly when it falls Mon-Wed', async () => {
  await fc.assert(fc.asyncProperty(fc.integer({ min: 1900, max: 2200 }), year => {
    const dec31 = new Date(Date.UTC(year, 11, 31))
    const id = isoWeekId(dec31)
    const weekday = dec31.getUTCDay()
    // Thursday of that ISO week falls into the next year iff Dec 31 is Mon-Wed
    const nextYearWeekOne = weekday >= 1 && weekday <= 3
    assert.equal(
      id === `${year + 1}-W01`,
      nextYearWeekOne,
      `${year}-12-31 (weekday ${weekday}): ${id}`
    )
  }))
})

test('property: consecutive Mondays differ by exactly one week', async () => {
  await fc.assert(fc.asyncProperty(utcDateArb, date => {
    const week = 7 * 24 * 3600000
    const a = isoWeekId(date)
    const b = isoWeekId(new Date(date.getTime() + week))
    const parse = id => {
      const [y, w] = id.split('-W')
      return { year: Number(y), week: Number(w) }
    }
    const pa = parse(a)
    const pb = parse(b)
    if (pa.year === pb.year) {
      assert.equal(pb.week, pa.week + 1, `${a} -> ${b}`)
    } else {
      assert.equal(pb.year, pa.year + 1, `${a} -> ${b}`)
      assert.equal(pb.week, 1, `${a} -> ${b}`)
    }
  }))
})

test('property: time of day within the same UTC day never changes the id', async () => {
  await fc.assert(fc.asyncProperty(utcDateArb, fc.integer({ min: 0, max: 86399999 }), (date, ms) => {
    const midnight = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    const later = new Date(midnight.getTime() + ms)
    assert.equal(isoWeekId(later), isoWeekId(midnight))
  }))
})
