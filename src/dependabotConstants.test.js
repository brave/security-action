/**
 * Tests for dependabotConstants module
 */
import { strict as assert } from 'assert'
import {
  DEFAULT_SKIP_HOTWORDS,
  Severity,
  nudgeSeverityForToday,
  severityKeysAbove
} from './dependabotConstants.js'

// ---- DEFAULT_SKIP_HOTWORDS ----

console.log('Testing DEFAULT_SKIP_HOTWORDS...')

assert.ok(Array.isArray(DEFAULT_SKIP_HOTWORDS), 'Should be an array')
assert.ok(DEFAULT_SKIP_HOTWORDS.length > 0, 'Should not be empty')
assert.ok(DEFAULT_SKIP_HOTWORDS.includes('dos'), 'Should include dos')
assert.ok(
  DEFAULT_SKIP_HOTWORDS.includes('denial of service'),
  'Should include denial of service'
)
console.log('  DEFAULT_SKIP_HOTWORDS: valid')

// ---- Severity ----

console.log('\nTesting Severity...')

assert.equal(Severity.low, 0)
assert.equal(Severity.medium, 1)
assert.equal(Severity.high, 2)
assert.equal(Severity.critical, 3)
console.log('  Severity: correct values')

// ---- nudgeSeverityForToday ----

console.log('\nTesting nudgeSeverityForToday...')

{
  const result = nudgeSeverityForToday()
  const today = new Date()
  const expected = today.getDate() <= 7 ? 'medium' : 'high'
  assert.equal(result, expected, `Should return ${expected} for day ${today.getDate()}`)
}
console.log('  nudgeSeverityForToday: correct for today')

// ---- severityKeysAbove ----

console.log('\nTesting severityKeysAbove...')

{
  const keys = severityKeysAbove('low')
  assert.deepEqual(keys, ['low', 'medium', 'high', 'critical'])
}
console.log('  severityKeysAbove: low includes all')

{
  const keys = severityKeysAbove('medium')
  assert.deepEqual(keys, ['medium', 'high', 'critical'])
}
console.log('  severityKeysAbove: medium includes medium+')

{
  const keys = severityKeysAbove('high')
  assert.deepEqual(keys, ['high', 'critical'])
}
console.log('  severityKeysAbove: high includes high+')

{
  const keys = severityKeysAbove('critical')
  assert.deepEqual(keys, ['critical'])
}
console.log('  severityKeysAbove: critical only')

// Test: accepts numeric values too
{
  const keys = severityKeysAbove(2)
  assert.deepEqual(keys, ['high', 'critical'])
}
console.log('  severityKeysAbove: accepts numeric input')

console.log('\n✅ All dependabotConstants tests passed!')
