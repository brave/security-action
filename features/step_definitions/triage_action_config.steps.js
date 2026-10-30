import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { writeTriageConfig, readTriageSummaries } from '../../src/steps/triageConfig.js'

function captureDir (world, fresh = false) {
  if (fresh || !world.params.captureDir) {
    world.params.captureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triage-config-'))
  }
  return world.params.captureDir
}

Given('default action options', function () {
  this.params.options = {}
})

Given('action options with triage enabled model {string} budget {string} max findings {string}', function (model, budget, maxFindings) {
  this.params.options = {
    triage_enabled: true,
    triage_model: model,
    triage_budget_usd: budget,
    triage_max_findings: maxFindings
  }
})

Given('the triage defaults from the action definition', function () {
  const src = fs.readFileSync('actions/main/action.cjs', 'utf8')
  const m = src.match(/triage_vanilla_cwes:\s*'([^']*)'/)
  assert.ok(m, 'triage_vanilla_cwes default missing from action.cjs')
  const yml = fs.readFileSync('actions/main/action.yml', 'utf8')
  const ymlBlock = yml.match(/triage_vanilla_cwes:\n(?: {4}.*\n)*? {4}default: '([^']*)'/)
  assert.ok(ymlBlock, 'triage_vanilla_cwes default missing from action.yml')
  assert.strictEqual(ymlBlock[1], m[1], 'action.yml and action.cjs vanilla cwe defaults disagree')
  this.params.options = { triage_enabled: true, triage_vanilla_cwes: m[1] }
})

Given('action options with triage enabled and vanilla cwe list {string}', function (cwes) {
  this.params.options = {
    triage_enabled: true,
    triage_vanilla_cwes: cwes
  }
})

Given('a capture dir with triage summaries for opengrep and sveltegrep', function () {
  const dir = captureDir(this)
  fs.writeFileSync(path.join(dir, 'opengrep-triage-summary.json'), JSON.stringify({ triaged: 2, suppressed: 1, annotated: 1, cost: 0.0003, model: 'm' }))
  fs.writeFileSync(path.join(dir, 'sveltegrep-triage-summary.json'), JSON.stringify({ triaged: 1, suppressed: 0, annotated: 1, cost: 0.0001, model: 'm' }))
})

Given('an empty capture dir', function () {
  captureDir(this)
})

When('the triage config is written to a capture dir', function () {
  this.params.config = writeTriageConfig({ captureDir: captureDir(this), options: this.params.options ?? {} })
})

When('the triage summaries are read', function () {
  this.params.summaries = readTriageSummaries({ captureDir: captureDir(this) })
})

Then('the triage config is disabled', function () {
  assert.equal(this.params.config.enabled, false)
})

Then('the triage config has no tool cwe list', function () {
  assert.deepEqual(this.params.config.vanillaCwes, [])
})

Then('the triage config vanilla cwe list is {string}', function (cwes) {
  assert.deepEqual(this.params.config.vanillaCwes, cwes.split(',').map((c) => c.trim()))
})

Then('the triage config is enabled', function () {
  assert.equal(this.params.config.enabled, true)
})

Then('the triage model is {string}', function (model) {
  assert.equal(this.params.config.model, model)
})

Then('the triage budget is {float} usd', function (budget) {
  assert.equal(this.params.config.budgetUsd, budget)
})

Then('the triage max findings is {int}', function (max) {
  assert.equal(this.params.config.maxFindings, max)
})

Then('the triage config carries the OPENROUTER_API_KEY env', function () {
  process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? 'sk-test'
  const config = writeTriageConfig({ captureDir: captureDir(this), options: this.params.options ?? {} })
  assert.equal(config.apiKey, 'sk-test')
})

Then('the summary line contains {string}', function (needle) {
  assert.ok(this.params.summaries.line.includes(needle), `expected ${needle} in ${this.params.summaries.line}`)
})

Then('the summary cost is {float} usd', function (cost) {
  assert.equal(Math.round(this.params.summaries.cost * 10000) / 10000, cost)
})

Then('the summary line is empty', function () {
  assert.equal(this.params.summaries.line, '')
})
