import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { applyTriageToLog } from '../../src/triage/logFilter.js'
import { policyDecision } from '../../src/triage/policy.js'

function row (file, line, label, confidence, reason) {
  return {
    caseId: `javascript/xss/test:${file}:${line}`,
    file,
    line,
    cwe: '79',
    verdict: { label, confidence, confidence_score: 0.9, reason, evidence: [{ file, lines: String(line), note: 'n' }] },
    agent: 'glm-5.3-flash'
  }
}

Given('a triage row for {string} line {int} with verdict {string} confidence {string} reason {string}', function (file, lineNo, label, confidence, reason) {
  this.params.rows = this.params.rows ?? []
  this.params.rows.push(row(file, lineNo, label, confidence, reason))
})

Given('a triage row for {string} line {int} with verdict {string} confidence {string} reason {string} repeated {int} times', function (file, lineNo, label, confidence, reason, times) {
  this.params.rows = this.params.rows ?? []
  this.params.rows.push(row(file, lineNo, label, confidence, reason.repeat(times)))
})

Given('a reviewdog log with 3 lines', function () {
  this.params.logLines = [
    'E:app/render.js:42 Unescaped value rendered into HTML<br>Source: brave/security-action',
    'E:app/db.js:7 SQL query built from string concatenation<br>Source: brave/security-action',
    'W:app/keep.js:3 Some other warning<br>Source: brave/security-action'
  ]
})

Given('a reviewdog log with a line for {string} line {int}', function (file, lineNo) {
  this.params.logLines = [`E:${file}:${lineNo} Finding on long file<br>Source: x`]
})

Given('a reviewdog log with a malformed line', function () {
  this.params.logLines = [
    'E:app/render.js:42 Unescaped value rendered into HTML<br>Source: brave/security-action',
    'E:app/db.js:7 SQL query built from string concatenation<br>Source: brave/security-action',
    'this line is not a reviewdog finding at all'
  ]
})

When('the log is filtered by triage verdicts', function () {
  const withDecision = (this.params.rows ?? []).map((r) => ({ ...r, decision: policyDecision(r.verdict, { cwe: r.cwe }) }))
  this.params.filtered = applyTriageToLog(this.params.logLines, withDecision)
})

function findLine (world, file, lineNo) {
  return world.params.filtered.lines.find((l) => l.includes(`${file}:${lineNo}`))
}

Then('the filtered log has {int} lines', function (n) {
  assert.equal(this.params.filtered.lines.length, n)
})

Then('the log line for {string} line {int} is gone', function (file, lineNo) {
  assert.equal(findLine(this, file, lineNo), undefined)
})

Then('the log line for {string} line {int} contains {string}', function (file, lineNo, needle) {
  const line = findLine(this, file, lineNo)
  assert.ok(line, `expected a log line for ${file}:${lineNo}`)
  assert.ok(line.includes(needle), `expected ${needle} in ${line}`)
})

Then('the log line for {string} line {int} is unchanged', function (file, lineNo) {
  const line = findLine(this, file, lineNo)
  assert.ok(line, `expected a log line for ${file}:${lineNo}`)
  assert.ok(!line.includes('🤖 triage'), 'line should not carry a triage note')
})

Then('the log line for {string} line {int} is at most {int} characters', function (file, lineNo, max) {
  const line = findLine(this, file, lineNo)
  assert.ok(line && line.length <= max, `expected line length <= ${max}, got ${line ? line.length : 'none'}`)
})

Then('the log line {string} is kept', function (needle) {
  assert.ok(this.params.filtered.lines.some((l) => l === needle), `expected ${needle} kept`)
})

Then('the suppressed count is {int}', function (n) {
  assert.equal(this.params.filtered.suppressedCount, n)
})

Then('the annotated count is {int}', function (n) {
  assert.equal(this.params.filtered.annotatedCount, n)
})
