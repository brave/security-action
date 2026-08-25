/* global J$ */
// ExpoSE symbolic harness: severityKeysAbove contiguity invariant.
// For every numeric level 0..3 the result must be the ordered suffix of
// severity names starting exactly at that level.
import { Severity, severityKeysAbove } from '../../../src/dependabotConstants.js'

const read = (d) => (typeof J$ !== 'undefined' ? J$.readInput(d) : d)

const level = read(2)
const names = Object.keys(Severity)
const keys = severityKeysAbove(level)

if (level >= 0 && level <= 3) {
  if (keys.length !== names.length - level) {
    throw new Error('unexpected key count ' + keys.length + ' for level ' + level)
  }
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== names[level + i]) {
      throw new Error('non-contiguous suffix at ' + i + ': ' + keys.join(','))
    }
  }
}
console.log('ok', level, '->', keys.join(','))
