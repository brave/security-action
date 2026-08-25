/* global J$ */
// ExpoSE symbolic harness: isoWeekId format and year-range invariants.
// Bundled to CJS by scripts/symbolic/run-expose.sh (bun build --format=cjs).
// Standalone (no ExpoSE): runs once with the concrete defaults.
import isoWeekId from '../../../src/isoWeekId.js'

const read = (d) => (typeof J$ !== 'undefined' ? J$.readInput(d) : d)

const year = 1990 + (read(2026) % 110)
const month = 1 + (read(8) % 12)
const day = 1 + (read(25) % 28)

const d = new Date(Date.UTC(year, month - 1, day))
const id = isoWeekId(d)

const m = /^(\d{4})-W(0[1-9]|[1-4]\d|5[0-3])$/.exec(id)
if (!m) throw new Error('malformed week id: ' + id)
if (Number(m[1]) < year - 1 || Number(m[1]) > year + 1) {
  throw new Error('week-year out of range: ' + id)
}
console.log('ok', year, month, day, '->', id)
