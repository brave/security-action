import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { formatTask } from '../../src/triage/task.js'
import { stableCaseId } from '../../src/triage/verdict.js'
import { createToolRegistry } from '../../src/triage/harness/tools.js'

Given('the repo has file {string} containing {string}', function (file, content) {
  this.params.repoRoot = '/repo'
  this.fsFiles = this.fsFiles ?? {}
  this.fsFiles[`/repo/${file}`] = content
  this.readFile = (path) => {
    if (!(path in this.fsFiles)) throw new Error(`ENOENT: ${path}`)
    return this.fsFiles[path]
  }
})

Given('a repo root {string} with file {string} containing:', function (root, file, content) {
  this.params.repoRoot = root
  this.fsFiles = this.fsFiles ?? {}
  this.fsFiles[`${root}/${file}`] = content
  this.readFile = (path) => {
    if (!(path in this.fsFiles)) throw new Error(`ENOENT: ${path}`)
    return this.fsFiles[path]
  }
})

Given('a triage case with case_id {string}', function (caseId) {
  this.params.case = { case_id: caseId }
})

Given('a triage case with no case_id', function () {
  this.params.case = {}
})

Given('the case file is {string}', function (file) {
  this.params.case.file = file
})

Given('the case tools are {string}', function (tools) {
  this.params.case.tool = tools.split(',').map(t => t.trim())
})

Given('the case raw_output has one Scanner finding {string} with message {string} at line {int}', function (ruleId, message, line) {
  this.params.case.raw_output = {
    Scanner: [{
      ruleId,
      message: { text: message },
      locations: [{ physicalLocation: { artifactLocation: { uri: this.params.case.file }, region: { startLine: line } } }]
    }]
  }
})

Given('the repo has no file {string}', function (file) {
  delete this.fsFiles[`${this.params.repoRoot}/${file}`]
})

When('the task is formatted with agent {string}', function (agent) {
  this.params.task = formatTask({
    caseJson: this.params.case,
    repoRoot: this.params.repoRoot,
    readFile: this.readFile,
    agent
  })
})

When('the task is formatted with agent {string} and a tool registry', function (agent) {
  const tools = createToolRegistry({ root: this.params.repoRoot, fsi: { readFileSync: this.readFile, readdirSync: () => [] } })
  this.params.task = formatTask({
    caseJson: this.params.case,
    repoRoot: this.params.repoRoot,
    readFile: this.readFile,
    agent,
    tools
  })
})

Then('the task contains {string}', function (needle) {
  assert.ok(this.params.task.includes(needle), `expected task to include ${needle}`)
})

Then('the task contains the file contents {string}', function (needle) {
  assert.ok(this.params.task.includes(needle))
})

Then('the task contains the rules {string}', function (needle) {
  assert.ok(this.params.task.includes(needle))
})

Then('the task contains the output schema keys {string}', function (keys) {
  for (const key of keys.split(',').map(k => k.trim())) {
    assert.ok(this.params.task.includes(key), `expected schema key ${key}`)
  }
})

Then('the task case_id starts with {string}', function (prefix) {
  const m = this.params.task.match(/case_id\*\*: `([^`]+)`/)
  assert.ok(m, 'task must contain a case_id')
  assert.ok(m[1].startsWith(prefix), `case_id ${m[1]} should start with ${prefix}`)
  assert.match(m[1], /^case-[0-9a-f]{12}$/)
  // stable: same case -> same id
  assert.equal(stableCaseId(this.params.case), m[1])
})
