import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import { generateMarkdownSummary } from '../../src/opengrepCompare.js'

function finding (path, line) {
  return { path, line, severity: 'ERROR', message: 'finding' }
}

Given('findings for rule {string} on files {string} at lines {int} and {int}', function (ruleId, file, lineA, lineB) {
  this.mdFindings = { [ruleId]: [finding(file, lineA), finding(file, lineB)] }
})

Given('findings for rule {string} on files {string} at line {int}', function (ruleId, file, line) {
  this.mdFindings = { ...this.mdFindings, [ruleId]: [finding(file, line)] }
})

Given('findings for rule {string} on file {string} at lines {int}, {int}, {int} and {int}', function (ruleId, file, a, b, c, d) {
  this.mdFindings = { [ruleId]: [finding(file, a), finding(file, b), finding(file, c), finding(file, d)] }
})

Given('findings for rule {string} on {int} files', function (ruleId, count) {
  const findings = []
  for (let i = 0; i < count; i++) {
    findings.push(finding(`src/file${i}.js`, i + 1))
  }
  this.mdFindings = { [ruleId]: findings }
})

Given('the rule statistics count {int} findings for {string} with severity {string}', function (count, ruleId, severity) {
  this.mdRuleStats = [...(this.mdRuleStats || []), { rule: ruleId, severity, count, isNew: false, newFindings: 0 }]
})

Given('the rule statistics count {int} finding for {string} with severity {string}', function (count, ruleId, severity) {
  this.mdRuleStats = [...(this.mdRuleStats || []), { rule: ruleId, severity, count, isNew: false, newFindings: 0 }]
})

Given('the rule statistics count {int} new finding for {string} with severity {string}', function (count, ruleId, severity) {
  this.mdRuleStats = [...(this.mdRuleStats || []), { rule: ruleId, severity, count, isNew: true, newFindings: count }]
})

Given('an empty delta against {int} base findings', function (baseTotal) {
  this.mdDelta = { newRules: [], newFindings: {}, removedFindings: {} }
  this.mdBaseTotal = baseTotal
})

Given('a delta introducing rule {string} with {int} new finding', function (ruleId, count) {
  const newFindings = []
  for (let i = 0; i < count; i++) {
    newFindings.push(finding('src/new.js', i + 1))
  }
  this.mdDelta = { newRules: [ruleId], newFindings: { [ruleId]: newFindings }, removedFindings: {} }
  this.mdBaseTotal = 1
})

When('generating the markdown summary', async function () {
  await this.attempt(() => generateMarkdownSummary(
    this.mdFindings || {},
    this.mdRuleStats || [],
    this.mdDelta || null,
    this.mdDelta ? 50 : 0,
    this.mdDelta ? this.mdBaseTotal : null,
    this.mdRepo || null,
    this.mdBranch || null
  ))
})

When('generating the markdown summary for repo {string} on branch {string}', async function (repo, branch) {
  this.mdRepo = repo
  this.mdBranch = branch
  await this.attempt(() => generateMarkdownSummary(
    this.mdFindings || {},
    this.mdRuleStats || [],
    this.mdDelta || null,
    this.mdDelta ? 50 : 0,
    this.mdDelta ? this.mdBaseTotal : null,
    repo,
    branch
  ))
})

Then('the summary contains {string}', function (text) {
  assert.ok(typeof this.result === 'string', 'expected a markdown string')
  assert.ok(this.result.includes(text), `${this.result} lacks "${text}"`)
})
