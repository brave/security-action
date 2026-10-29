import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const SCRIPT = path.resolve('scripts/triage-filter.mjs')

function workspace (world) {
  if (!world.params.wsDir) {
    world.params.wsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triage-filter-'))
    world.params.securityDir = path.join(world.params.wsDir, 'security-action')
    fs.mkdirSync(world.params.securityDir, { recursive: true })
    world.params.logPath = path.join(world.params.wsDir, 'opengrep.log')
  }
  return world.params.wsDir
}

function writeConfig (world, config) {
  const dir = workspace(world)
  world.params.configPath = path.join(dir, 'security-action', 'triage-config.json')
  fs.writeFileSync(world.params.configPath, JSON.stringify(config))
}

Given('a triage filter workspace with a disabled config', function () {
  writeConfig(this, { enabled: false, model: 'z-ai/glm-5.3-flash', budgetUsd: 1, maxFindings: 50 })
})

Given('a triage filter workspace with an enabled config', function () {
  writeConfig(this, { enabled: true, model: 'z-ai/glm-5.3-flash', budgetUsd: 1, maxFindings: 50 })
})

Given('a reviewdog log for runner {string}', function (runner) {
  const dir = workspace(this)
  this.params.logPath = path.join(dir, `${runner}.log`)
  this.params.inputLog = [
    'E:app/render.js:42 Unescaped value rendered into HTML<br>Source: brave/security-action',
    'E:app/db.js:7 SQL query built from string concatenation<br>Source: brave/security-action'
  ]
  fs.writeFileSync(this.params.logPath, `${this.params.inputLog.join('\n')}\n`)
})

Given('slim findings matching the log line for {string} line {int}', function (file, lineNo) {
  const dir = workspace(this)
  const record = {
    check_id: 'javascript/xss/render',
    path: file,
    line: lineNo,
    severity: 'ERROR',
    message: 'Unescaped value rendered into HTML',
    cwe: 'CWE-79: Cross-site Scripting',
    source: 'brave/security-action',
    category: 'security',
    assignees: 'null'
  }
  fs.writeFileSync(path.join(dir, 'security-action', 'opengrep-slim.jsonl'), `${JSON.stringify(record)}\n`)
})

Given('the mock model answers verdict {string} confidence {string} reason {string}', function (label, confidence, reason) {
  const dir = workspace(this)
  const verdict = { label, confidence, confidence_score: confidence === 'high' ? 0.9 : 0.5, reason, evidence: [{ file: 'app/x.js', lines: '1', note: 'n' }] }
  worldMock(dir, [{ content: null, finishReason: 'tool_calls', usage: { cost: 0.0001 }, toolCalls: [{ id: 'd1', name: 'done', arguments: JSON.stringify(verdict) }] }])
})

function worldMock (dir, responses) {
  fs.writeFileSync(path.join(dir, 'mock-chat.json'), JSON.stringify(responses))
}

When('the triage filter runs for runner {string}', function (runner) {
  const dir = workspace(this)
  const args = [
    SCRIPT,
    '--runner', runner,
    '--log', this.params.logPath,
    '--config', path.join(dir, 'security-action', 'triage-config.json'),
    '--raw', path.join(dir, 'security-action', `${runner}-slim.jsonl`),
    '--workspace', dir
  ]
  if (fs.existsSync(path.join(dir, 'mock-chat.json'))) args.push('--mock-chat', path.join(dir, 'mock-chat.json'))
  try {
    this.params.run = { stdout: execFileSync('node', args, { encoding: 'utf8', cwd: dir }), code: 0 }
  } catch (err) {
    this.params.run = { stdout: err.stdout ?? '', code: err.status ?? 1, stderr: err.stderr ?? '' }
  }
})

Then('the filter exit code is {int}', function (code) {
  assert.equal(this.params.run.code, code, `stderr: ${this.params.run.stderr}`)
})

Then('the filtered log equals the input log', function () {
  const after = fs.readFileSync(this.params.logPath, 'utf8')
  assert.deepEqual(after.split('\n').filter(Boolean), this.params.inputLog)
})

Then('the filtered log contains {string}', function (needle) {
  const after = fs.readFileSync(this.params.logPath, 'utf8')
  assert.ok(after.includes(needle), `expected ${needle} in log:\n${after}`)
})

Then('the filtered log does not contain {string}', function (needle) {
  const after = fs.readFileSync(this.params.logPath, 'utf8')
  assert.ok(!after.includes(needle), `expected ${needle} absent from log:\n${after}`)
})

Then('the filter summary reports {int} triaged', function (n) {
  const summary = JSON.parse(this.params.run.stdout)
  assert.equal(summary.triaged, n)
})

Then('the filter summary reports {int} suppressed', function (n) {
  const summary = JSON.parse(this.params.run.stdout)
  assert.equal(summary.suppressed, n)
})
