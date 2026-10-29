import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { opengrepFindingsToQueue } from '../../src/triage/findingsQueue.js'
import { policyDecision } from '../../src/triage/policy.js'

const SLIM = (over = {}) => ({
  check_id: 'javascript/xss/render',
  path: 'app/render.js',
  line: 42,
  severity: 'ERROR',
  message: 'Unescaped value rendered into HTML',
  cwe: 'CWE-79: Cross-site Scripting',
  source: 'brave/security-action',
  category: 'security',
  assignees: 'null',
  ...over
})

function makeSlimCapture (records) {
  return records.map((r) => JSON.stringify(r)).join('\n')
}

Given('a slim opengrep capture with 2 findings', function () {
  this.params.rawJson = makeSlimCapture([
    SLIM({ cwe: ['CWE-79: Cross-site Scripting'] }),
    SLIM({ check_id: 'javascript/sqli/query', path: 'app/db.js', line: 7, cwe: 'CWE-89: SQL Injection' })
  ])
})

Given('a slim opengrep capture with a finding without cwe metadata', function () {
  this.params.rawJson = makeSlimCapture([SLIM({ cwe: '' }), SLIM()])
})

Given('a slim opengrep capture with a string-cwe finding', function () {
  this.params.rawJson = makeSlimCapture([SLIM()])
})

Given('a slim opengrep capture with a finding missing its path', function () {
  this.params.rawJson = makeSlimCapture([SLIM({ path: undefined }), SLIM({ path: 'app/ok.js' })])
})

Given('a slim opengrep capture that is empty', function () {
  this.params.rawJson = ''
})

Given('a slim opengrep capture with a malformed record', function () {
  this.params.rawJson = '{oops\n' + JSON.stringify(SLIM())
})

When('the findings are converted to a triage queue', function () {
  this.params.queue = opengrepFindingsToQueue(this.params.rawJson, { repoRoot: '/repo' })
})

Given('a verdict of label {string} confidence {string} for cwe {string}', function (label, confidence, cwe) {
  this.params.verdict = { label, confidence, confidence_score: confidence === 'high' ? 0.9 : 0.5, reason: 'r', evidence: [{ file: 'app/render.js', lines: '42', note: 'n' }] }
  this.params.cwe = cwe === 'null' ? null : cwe
})

Given('a verdict of label {string} confidence {string} with empty evidence for cwe {string}', function (label, confidence, cwe) {
  this.params.verdict = { label, confidence, confidence_score: 0.9, reason: 'r', evidence: [] }
  this.params.cwe = cwe === 'null' ? null : cwe
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

Then('the skipped reason is {string}', function (reason) {
  for (const s of this.params.queue.skipped) assert.equal(s.reason, reason)
})
