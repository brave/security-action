/* global J$ */
// ExpoSE symbolic harness: patternToRegex('src/*') segment-boundary invariant.
// For every possible filename string, a match must start at a path-segment
// boundary ("src/" at the start or right after a '/').
import { patternToRegex } from '../../../src/matchCodeowners.js'

const read = (d) => (typeof J$ !== 'undefined' ? J$.readInput(d) : d)

const file = read('src/a.js')
const re = patternToRegex('src/*')

if (re.test(file)) {
  if (!/(^|\/)src\//.test(file)) {
    throw new Error('match outside segment boundary: ' + file)
  }
}
console.log('ok', file, '->', re.test(file))
