import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { logLinesToQueue } from '../../src/triage/findingsQueue.js'
import { policyDecision } from '../../src/triage/policy.js'

const line = (path, num, message, meta) =>
  `E:${path}:${num} ${message}<br><br>Source: brave/security-action<br><br>${meta},null`

const META = (cwe, rule) => `<!-- Category: security, CWE: ${cwe}, Rule: ${rule} -->`

Given('an enriched reviewdog log with 2 findings', function () {
  this.params.logLines = [
    line('app/render.js', 42, 'Unescaped value rendered into HTML', META('CWE-79: Cross-site Scripting', 'javascript/xss/render')),
    line('app/db.js', 7, 'SQL built by string concatenation', META('CWE-89: SQL Injection', 'javascript/sqli/query'))
  ]
})

Given('an enriched reviewdog log with a line without metadata', function () {
  this.params.logLines = ['E:package-lock.json:5 Dependency lodash pinned to 4.17.15']
})

Given('an enriched reviewdog log with a non-finding line', function () {
  this.params.logLines = [
    line('app/render.js', 42, 'Unescaped value rendered into HTML', META('CWE-79: Cross-site Scripting', 'javascript/xss/render')),
    'reviewdog: 1 findings found'
  ]
})

Given('an empty reviewdog log', function () {
  this.params.logLines = []
})

When('the log lines are converted to a triage queue', function () {
  this.params.queue = logLinesToQueue(this.params.logLines, { repoRoot: '/repo', runner: 'npm-audit' })
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

Then('item {int} raw output has {int} result(s)', function (n, count) {
  const raw = this.params.queue.items[n - 1].caseJson.raw_output
  assert.equal(Object.values(raw)[0].length, count)
})

Then('item {int} file is {string}', function (n, file) {
  assert.equal(this.params.queue.items[n - 1].caseJson.file, file)
})

Then('item {int} line is {int}', function (n, num) {
  assert.equal(this.params.queue.items[n - 1].line, num)
})

Then('item {int} message is {string}', function (n, message) {
  assert.equal(Object.values(this.params.queue.items[n - 1].caseJson.raw_output)[0][0].message, message)
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
