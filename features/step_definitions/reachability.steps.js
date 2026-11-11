import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  enclosingFunction,
  findCallers,
  reachableFromEntry,
  createReachTool,
  loadOgRuleModes
} from '../../src/triage/reachability.js'
import { createToolRegistry } from '../../src/triage/harness/tools.js'

function buildFsi (files) {
  const dirs = new Set()
  for (const p of Object.keys(files)) {
    let dir = p.split('/').slice(0, -1).join('/')
    while (dir) {
      dirs.add(dir)
      dir = dir.split('/').slice(0, -1).join('/')
    }
  }
  return {
    readFileSync (path) {
      if (!(path in files)) throw new Error(`ENOENT: ${path}`)
      return files[path]
    },
    readdirSync (dir) {
      if (!dirs.has(dir)) throw new Error(`ENOTDIR: ${dir}`)
      const prefix = `${dir}/`
      const names = new Set()
      for (const p of Object.keys(files)) {
        if (!p.startsWith(prefix)) continue
        names.add(p.slice(prefix.length).split('/')[0])
      }
      return [...names].sort()
    }
  }
}

Given('a file system with:', function (table) {
  this.fsFiles = this.fsFiles ?? {}
  for (const row of table.hashes()) {
    this.fsFiles[row.path] = row.content.split('\\n').join('\n')
  }
  this.fsi = buildFsi(this.fsFiles)
})

Given('a repo root {string}', function (root) {
  this.params.root = root
})

When('the enclosing function of {string} line {int} is computed', function (file, line) {
  this.enclosing = enclosingFunction({
    fsi: this.fsi,
    file,
    line
  })
})

Then('the enclosing function name is {string}', function (name) {
  assert.equal(this.enclosing.name, name)
})

Then('the enclosing function starts at line {int}', function (line) {
  assert.equal(this.enclosing.startLine, line)
})

Then('no enclosing function is found', function () {
  assert.equal(this.enclosing, null)
})

When('the callers of {string} are computed', function (name) {
  this.callers = findCallers({ fsi: this.fsi, root: this.params.root, name })
})

Then('the caller list size is {int}', function (n) {
  assert.equal(this.callers.length, n)
})

Then('the caller list contains {string}', function (file) {
  assert.ok(this.callers.some((c) => c.file === file), JSON.stringify(this.callers))
})

When('reachability of {string} line {int} function {string} is computed', function (file, line, name) {
  this.reach = reachableFromEntry({
    fsi: this.fsi,
    root: this.params.root,
    file,
    line
  })
  assert.equal(this.reach.target, name)
})

Then('the reachability verdict is {string}', function (verdict) {
  assert.equal(this.reach.verdict, verdict)
})

Then('the reachability chain is {string}', function (chain) {
  assert.equal(this.reach.chain, chain)
})

Given('the reach tool is configured', function () {
  this.reachTool = createReachTool({
    ogRules: {},
    fsi: this.fsi,
    root: this.params.root
  })
})

When('the reach tool runs with file {string} line {int} and rule {string}', async function (file, line, ruleId) {
  this.params.toolResult = await this.reachTool.run({ file, line, ruleId })
})

Given('the reach tool is configured with opengrep rule modes', function () {
  this.reachTool = createReachTool({
    ogRules: { 'x-ssti': 'taint' },
    fsi: this.fsi,
    root: this.params.root
  })
})

Given('an opengrep rules directory with taint and search rules', function () {
  this.fsFiles = this.fsFiles ?? {}
  this.fsFiles['rules/taint.yaml'] = [
    'rules:',
    '  - id: x-ssti',
    '    mode: taint',
    '    pattern-sources:',
    '      - pattern: $INPUT',
    '    pattern-sinks:',
    '      - pattern: sink($INPUT)'
  ].join('\n')
  this.fsFiles['rules/search.yaml'] = [
    'rules:',
    '  - id: x-noop',
    '    pattern: noop($X)'
  ].join('\n')
  this.ogFsi = buildFsi(this.fsFiles)
})

When('the opengrep rule modes are loaded', async function () {
  this.ogRules = await loadOgRuleModes({ fsi: this.ogFsi, root: 'rules' })
})

Then('rule {string} has scanner mode {string}', function (ruleId, mode) {
  assert.equal(this.ogRules[ruleId], mode)
})

Given("the repository's opengrep rules are loaded", async function () {
  this.ogRules = await loadOgRuleModes({
    fsi: { readFileSync: (p) => fs.readFileSync(p, 'utf8'), readdirSync: (d) => fs.readdirSync(d) },
    root: path.join(process.cwd(), 'assets/opengrep_rules')
  })
  this.realOgRules = this.ogRules
})

Then('at least {int} taint rules are loaded', function (n) {
  const taints = Object.values(this.realOgRules).filter((m) => m === 'taint').length
  assert.ok(taints >= n, `expected >= ${n} taint rules, got ${taints}`)
})

Given('the reach tool is configured with the loaded scanner modes', function () {
  this.reachTool = createReachTool({
    ogRules: this.realOgRules,
    fsi: this.fsi,
    root: this.params.root
  })
})

Given('a tool registry with reach enabled', function () {
  this.registry = createToolRegistry({
    root: this.params.root,
    fsi: this.fsi,
    reach: this.reachTool ?? createReachTool({
      ogRules: {},
      fsi: this.fsi,
      root: this.params.root
    })
  })
})
