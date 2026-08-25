import test from 'node:test'
import assert from 'node:assert'
import fc from 'fast-check'
import { groupFindingsByRule, calculateDelta } from './opengrepCompare.js'

const ruleIdArb = fc.stringMatching(/^[a-z][a-z0-9_.]{0,11}$/)
const pathArb = fc.stringMatching(/^[a-z][a-z0-9_/]{0,20}\.js$/)

const findingArb = fc.record({
  check_id: ruleIdArb,
  path: pathArb,
  line: fc.integer({ min: 1, max: 999 })
})

const resultsArb = fc.array(findingArb, { maxLength: 25 })

function toScanResult (f) {
  return {
    check_id: f.check_id,
    path: f.path,
    start: { line: f.line },
    extra: { severity: 'ERROR', message: 'm' }
  }
}

test('property: grouping preserves the total finding count', () => {
  fc.assert(fc.property(resultsArb, (findings) => {
    const grouped = groupFindingsByRule(findings.map(toScanResult))
    const total = Object.values(grouped).reduce((n, list) => n + list.length, 0)
    assert.equal(total, findings.length)
    for (const [ruleId, list] of Object.entries(grouped)) {
      assert.ok(list.length > 0)
      for (const item of list) {
        assert.equal(item.severity, 'ERROR')
        assert.equal(typeof item.line, 'number')
        assert.equal(typeof item.path, 'string')
      }
      assert.ok(findings.some(f => f.check_id === ruleId))
    }
  }))
})

test('property: identical branch scans produce an empty delta', () => {
  fc.assert(fc.property(resultsArb, (findings) => {
    const grouped = groupFindingsByRule(findings.map(toScanResult))
    const delta = calculateDelta(grouped, grouped)
    assert.deepEqual(delta.newRules, [])
    assert.deepEqual(delta.newFindings, {})
    assert.deepEqual(delta.removedFindings, {})
  }))
})

test('property: every current finding is new when the base scan is empty', () => {
  fc.assert(fc.property(resultsArb, (findings) => {
    const grouped = groupFindingsByRule(findings.map(toScanResult))
    const delta = calculateDelta({}, grouped)
    const total = Object.values(delta.newFindings).flat().length
    assert.equal(total, findings.length)
    assert.deepEqual(delta.newRules.sort(), Object.keys(grouped).sort())
    assert.deepEqual(delta.removedFindings, {})
  }))
})

test('property: delta is idempotent across repeated comparisons', () => {
  fc.assert(fc.property(resultsArb, resultsArb, (baseFindings, currentFindings) => {
    const base = groupFindingsByRule(baseFindings.map(toScanResult))
    const current = groupFindingsByRule(currentFindings.map(toScanResult))
    const first = calculateDelta(base, current)
    const second = calculateDelta(base, current)
    assert.deepEqual(first, second)
  }))
})

test('property: basePath stripping only affects prefixed paths', () => {
  fc.assert(fc.property(resultsArb, fc.stringMatching(/^\/tmp\/scan-[a-z0-9]{1,8}$/), (findings, base) => {
    const results = findings.map(f => ({
      ...toScanResult(f),
      path: `${base}/${f.path}`
    }))
    const grouped = groupFindingsByRule(results, base)
    const all = Object.values(grouped).flat()
    for (const item of all) {
      assert.ok(!item.path.startsWith('/'), `path not stripped: ${item.path}`)
    }
    assert.equal(all.length, findings.length)
  }))
})
