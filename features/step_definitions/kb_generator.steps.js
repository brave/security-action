import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { loadKb, scopeRules } from '../../src/triage/kb.js'
import { generateForRule } from '../../src/triage/generator.js'
import { logLinesToQueue } from '../../src/triage/findingsQueue.js'
import { createToolRegistry } from '../../src/triage/harness/tools.js'

function kbFsi (world) {
  const stripRoot = (dir) => dir.replace(/^root\/?/, '').replace(/\/?$/, '/')
  return {
    readFileSync: (p) => {
      const rel = p.replace(/^.*?rules\//, 'rules/')
      if (!(rel in world.kbFiles)) throw new Error(`file not found: ${p}`)
      return world.kbFiles[rel]
    },
    readdirSync: (dir) => {
      const prefix = stripRoot(dir)
      const names = new Set()
      for (const key of Object.keys(world.kbFiles)) {
        if (key.startsWith(prefix)) names.add(key.slice(prefix.length).split('/')[0])
      }
      if (!names.size && prefix !== 'rules/') throw new Error(`not a directory: ${dir}`)
      return [...names].filter(Boolean)
    }
  }
}

Given('a knowledge-base tree with rules:', function (mdText) {
  this.kbFiles = {}
  const blocks = mdText.split(/(?=^\s*rules\/)/m).map((b) => b.replace(/^\n+/, '')).filter(Boolean)
  for (const block of blocks) {
    const lines = block.split('\n')
    const key = lines[0].trim().replace(/:$/, '')
    const body = lines.slice(1).map((l) => l.replace(/^ {2}/, '')).join('\n')
    this.kbFiles[key] = body
  }
})

Given('a COMMON_METADATA for {string} with:', function (dir, text) {
  this.kbFiles[`rules/${dir}/COMMON_METADATA`] = text
})

Given('the real knowledge-base at {string}', function (root) {
  this.params.kbRoot = root
})

When('the knowledge-base is loaded', function () {
  if (this.params.kbRoot) {
    this.params.rules = loadKb({ root: this.params.kbRoot, fsi: fs })
  } else {
    this.params.rules = loadKb({ root: 'root', fsi: kbFsi(this) })
  }
})

Then('there is {int} rule named {string} with rubric {string} cwe {string} and {int} path expression', function (n, name, rubric, cwe, exprs) {
  const rules = this.params.rules
  assert.equal(rules.length, n)
  assert.equal(rules[0].name, name)
  assert.equal(rules[0].rubric, rubric)
  assert.deepEqual(rules[0].cwe, [cwe])
  assert.equal(rules[0].pathExpressions.length, exprs)
})

Given('the rules are scoped to changed files {string}', function (files) {
  this.params.changedFiles = files.split(', ').map((f) => f.replace(/"/g, ''))
  this.params.scoped = scopeRules({ rules: this.params.rules ?? [], changedFiles: this.params.changedFiles })
})

Then('the scoped rules are empty', function () {
  assert.equal(this.params.scoped.length, 0)
})

Then('{int} scoped rule remains with files {string}', function (n, files) {
  assert.equal(this.params.scoped.length, n)
  assert.deepEqual(this.params.scoped[0].files, files.split(', '))
})

Given('a fake model client with script:', function (table) {
  const script = table.hashes().map((row) => ({
    tool: row.tool || null,
    arguments: row.arguments ?? ''
  }))
  this.params.requests = []
  this.chat = async ({ model, messages, tools }) => {
    this.params.requests.push({ model, messages: messages.map((m) => ({ ...m })), tools })
    const step = script.shift()
    if (!step) throw new Error('fake model client: script exhausted')
    return {
      content: null,
      finishReason: step.tool ? 'tool_calls' : 'stop',
      usage: { prompt_tokens: 5, completion_tokens: 2, cost: 0.0001 },
      toolCalls: step.tool ? [{ id: `call_${this.params.requests.length}`, name: step.tool, arguments: step.arguments }] : []
    }
  }
})

Given('a repo file {string} with content:', function (file, content) {
  this.repoFiles ??= {}
  this.repoFiles[file] = content
})

When('the generation agent runs for the scoped rules', async function () {
  const root = '/repo'
  const fsi = {
    readFileSync: (p) => {
      const rel = p.startsWith(root) ? p.slice(root.length + 1) : p
      if (!(rel in (this.repoFiles ?? {}))) throw new Error(`file not found: ${p}`)
      return this.repoFiles[rel]
    },
    readdirSync: (dir) => {
      const prefix = dir.replace(/\/?$/, '/')
      const names = new Set()
      for (const key of Object.keys(this.repoFiles ?? {})) {
        if (key.startsWith(prefix)) names.add(key.slice(prefix.length).split('/')[0])
      }
      return [...names]
    }
  }
  this.registry = createToolRegistry({ root, fsi, exec: null })
  this.params.lines = []
  this.params.runs = []
  for (const { rule, files } of this.params.scoped) {
    const res = await generateForRule({ chat: this.chat, model: 'fake-model', rule, files, tools: this.registry })
    this.params.lines.push(...res.logLines)
    this.params.runs.push(res)
  }
})

Then('the run produces the log line {string}', function (line) {
  assert.ok(this.params.lines.includes(line), `lines:\n${this.params.lines.join('\n')}`)
})

Then('the log line parses into a queue item with cwe {int} and rule {string}', function (cwe, rule) {
  const { items } = logLinesToQueue(this.params.lines, { repoRoot: '/repo' })
  assert.equal(items.length, 1)
  assert.equal(String(items[0].cwe), String(cwe))
  assert.equal(items[0].caseJson.tool[0], rule)
})

Then('no log lines are produced and the run stopped with {string}', function (stopped) {
  assert.deepEqual(this.params.lines, [])
  for (const r of this.params.runs) assert.equal(r.stopped, stopped)
})

Then('the model received a retry correction', function () {
  const last = this.params.requests.at(-1)
  const correction = last.messages.find((m) => m.role === 'tool' && /Invalid result/.test(m.content))
  assert.ok(correction, `no correction in messages: ${JSON.stringify(last.messages.map((m) => [m.role, String(m.content).slice(0, 60)]))}`)
})
Then('at least {int} rules loaded and at least {int} scoped rules remain', function (minRules, minScoped) {
  assert.ok(this.params.rules.length >= minRules, `only ${this.params.rules.length} rules`)
  assert.ok(this.params.scoped.length >= minScoped, `only ${this.params.scoped.length} scoped`)
})
