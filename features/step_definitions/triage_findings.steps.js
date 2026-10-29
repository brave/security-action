import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { opengrepFindingsToQueue } from '../../src/triage/findingsQueue.js'
import { policyDecision } from '../../src/triage/policy.js'

const RESULT = (over = {}) => ({
  check_id: 'javascript/xss/render',
  path: 'app/render.js',
  start: { line: 42, col: 3 },
  end: { line: 42, col: 30 },
  extra: {
    severity: 'ERROR',
    message: 'Unescaped value rendered into HTML',
    metadata: { cwe: 'CWE-79: Cross-site Scripting', source: 'brave/security-action', category: 'security' },
    lines: 'let el = `<div>$' + '{value}</div>`'
  },
  ...over
})

function makeRawJson (results, errors = []) {
  return JSON.stringify({ results, errors })
}

Given('a raw opengrep JSON with 2 findings and no errors', function () {
  this.params.rawJson = makeRawJson([RESULT(), RESULT({ check_id: 'javascript/sqli/query', path: 'app/db.js', start: { line: 7 }, end: { line: 7 }, extra: { ...RESULT().extra, metadata: { source: 'x' } } })])
})

Given('a raw opengrep JSON with a finding missing its path', function () {
  this.params.rawJson = makeRawJson([RESULT({ path: undefined }), RESULT({ path: 'app/ok.js' })])
})

Given('a raw opengrep JSON with only errors', function () {
  this.params.rawJson = makeRawJson([], [{ type: 'semgrep-error', message: 'boom' }])
})

When('the findings are converted to a triage queue', function () {
  this.params.queue = opengrepFindingsToQueue(this.params.rawJson, { repoRoot: '/repo' })
})

Given('a verdict of label {string} confidence {string} for cwe {string}', function (label, confidence, cwe) {
  this.params.verdict = { label, confidence, confidence_score: confidence === 'high' ? 0.9 : 0.5, reason: 'r', evidence: [{ file: 'app/render.js', lines: '42', note: 'n' }] }
  this.params.cwe = cwe
})

Given('a verdict of label {string} confidence {string} with empty evidence for cwe {string}', function (label, confidence, cwe) {
  this.params.verdict = { label, confidence, confidence_score: 0.9, reason: 'r', evidence: [] }
  this.params.cwe = cwe
})

Given('a policy allowlist of {string}', function (csv) {
  this.params.allowCwes = csv.split(',')
})

Then('the policy decision is {string}', function (decision) {
  assert.equal(policyDecision(this.params.verdict, { cwe: this.params.cwe, allowCwes: this.params.allowCwes }), decision)
})

Then('a verdict of label {string} confidence {string} for cwe {string} has decision {string}', function (label, confidence, cwe, decision) {
  const verdict = { label, confidence, confidence_score: 0.9, reason: 'r', evidence: [{ file: 'f', lines: '1', note: 'n' }] }
  assert.equal(policyDecision(verdict, { cwe, allowCwes: this.params.allowCwes }), decision)
})

Then('the findings queue has {int} items', function (n) {
  assert.equal(this.params.queue.items.length, n)
})

Then('every item has no ground truth label', function () {
  for (const item of this.params.queue.items) assert.equal(item.label, null)
})

Then('every item has a repo root of {string}', function (repoRoot) {
  for (const item of this.params.queue.items) assert.equal(item.repoRoot, repoRoot)
})

Then('item {int} has case id {string}', function (n, caseId) {
  assert.equal(this.params.queue.items[n - 1].caseId, caseId)
})

Then('item {int} raw output has {int} opengrep result(s)', function (n, count) {
  const raw = this.params.queue.items[n - 1].caseJson.raw_output
  assert.equal(raw.Opengrep.length, count)
})

Then('item {int} file is {string}', function (n, file) {
  assert.equal(this.params.queue.items[n - 1].caseJson.file, file)
})

Then('item {int} cwe is {string}', function (n, cwe) {
  const actual = this.params.queue.items[n - 1].cwe
  if (cwe === 'null') assert.equal(actual, null)
  else assert.equal(actual, cwe)
})

Then('the skipped count is {int}', function (n) {
  assert.equal(this.params.queue.skipped.length, n)
})
