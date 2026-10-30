import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { createToolRegistry, globToRegExp, isSourcePath } from '../../src/triage/harness/tools.js'

Given('a tool registry rooted at {string} with files:', function (root, table) {
  this.params.root = root
  this.fsFiles = this.fsFiles ?? {}
  const dirs = new Set()
  for (const row of table.hashes()) {
    this.fsFiles[`${root}/${row.path}`] = row.content.split('\\n').join('\n')
    let dir = row.path.split('/').slice(0, -1).join('/')
    while (dir) {
      dirs.add(`${root}/${dir}`)
      dir = dir.split('/').slice(0, -1).join('/')
    }
  }
  this.fsi = makeFsi(root, this.fsFiles, dirs, this.lockedFiles)
  this.dirs = dirs
  this.registry = createToolRegistry({ root, fsi: this.fsi })
})

Given('an exec runner that returns {string}', function (template) {
  this.execCalls = []
  this.registry = createToolRegistry({
    root: this.params.root,
    fsi: this.fsi,
    exec: async (command) => {
      this.execCalls.push(command)
      return template.replace('{command}', command)
    }
  })
})

Given('an exec runner that throws {string}', function (message) {
  this.registry = createToolRegistry({
    root: this.params.root,
    fsi: this.fsi,
    exec: async () => { throw new Error(message) }
  })
})

Given('a search tool that returns {string}', function (output) {
  this.searchQuery = null
  this.registry = createToolRegistry({
    root: this.params.root,
    fsi: this.fsi,
    search: async ({ query }) => {
      this.searchQuery = query
      return output
    }
  })
})

When('the websearch tool runs with query {string}', async function (query) {
  this.params.toolResult = await this.registry.run('websearch', { query })
})

When('the done tool runs with verdict arguments', async function () {
  this.doneArgs = {
    label: 'TP',
    confidence: 'high',
    confidence_score: 0.9,
    reason: 'constant folding proves the branch unreachable',
    evidence: [{ file: 'src/App.java', lines: [2], note: 'literal condition' }]
  }
  this.params.toolResult = await this.registry.run('done', this.doneArgs)
})

Then('the done tool echoes its arguments', function () {
  assert.equal(this.params.toolResult.ok, true)
  assert.equal(this.params.toolResult.output, String(this.doneArgs))
})

Then('the registry exposes the tools {string}', function (expected) {
  assert.equal(this.registry.names().join(', '), expected)
})

Then('the schema contains a function {string} requiring {string}', function (name, required) {
  const entry = this.registry.schema().find(s => s.type === 'function' && s.function.name === name)
  assert.ok(entry, `schema should contain ${name}`)
  assert.equal(typeof entry.function.description, 'string')
  assert.equal(entry.function.parameters.type, 'object')
  assert.ok(entry.function.parameters.required.includes(required), `${name} should require ${required}`)
})

Then('the schema contains no function {string}', function (name) {
  const found = this.registry.schema().some(s => s.function.name === name)
  assert.equal(found, false, `schema should not contain ${name}`)
})

Given('a file {string} that cannot be read', function (path) {
  this.lockedFiles = this.lockedFiles ?? new Set()
  const full = `${this.params.root}/${path}`
  this.lockedFiles.add(full)
  this.fsFiles = this.fsFiles ?? {}
  this.fsFiles[full] = 'secret content\nint locked;'
  this.fsi = makeFsi(this.params.root, this.fsFiles, this.dirs ?? new Set(), this.lockedFiles)
  this.registry = createToolRegistry({ root: this.params.root, fsi: this.fsi })
})

When('the glob helper matches {string} against {string}', function (pattern, candidate) {
  this.params.globResult = globToRegExp(pattern).test(candidate)
})

Then('the glob result is {string}', function (expected) {
  assert.equal(this.params.globResult, expected === 'true')
})

When('the source path guard checks {string}', function (path) {
  this.params.guardVerdict = isSourcePath(path)
})

Then('the guard verdict is {string}', function (expected) {
  assert.equal(this.params.guardVerdict, expected === 'true')
})

When('the view tool runs with file {string}', async function (file) {
  this.params.toolResult = await this.registry.run('view', { file })
})

When('the view tool runs with file {string}, start line {int} and end line {int}', async function (file, startLine, endLine) {
  this.params.toolResult = await this.registry.run('view', { file, startLine, endLine })
})

When('the grep tool runs with pattern {string}', async function (pattern) {
  this.params.toolResult = await this.registry.run('grep', { pattern })
})

When('the grep tool runs with pattern {string} and glob {string}', async function (pattern, glob) {
  this.params.toolResult = await this.registry.run('grep', { pattern, glob })
})

When('the find tool runs with pattern {string}', async function (pattern) {
  this.params.toolResult = await this.registry.run('find', { pattern })
})

When('the exec tool runs with command {string}', async function (command) {
  this.params.toolResult = await this.registry.run('exec', { command })
})

Then('the tool output contains {string}', function (needle) {
  assert.equal(this.params.toolResult.ok, true, `expected ok, got error: ${this.params.toolResult.error}`)
  assert.ok(this.params.toolResult.output.includes(needle), `output should include ${needle}`)
})

Then('the tool output does not contain {string}', function (needle) {
  assert.equal(this.params.toolResult.ok, true)
  assert.ok(!this.params.toolResult.output.includes(needle))
})

Then('the tool output is {string}', function (expected) {
  assert.equal(this.params.toolResult.ok, true, `expected ok, got error: ${this.params.toolResult.error}`)
  assert.equal(this.params.toolResult.output, expected.split('\\n').join('\n'))
})

Then('the tool fails with error {string}', function (needle) {
  assert.equal(this.params.toolResult.ok, false)
  assert.ok(this.params.toolResult.error.includes(needle), `error ${this.params.toolResult.error} should include ${needle}`)
})

function makeFsi (root, files, dirs, locked) {
  return {
    readFileSync: (path) => {
      if (locked && locked.has(path)) throw new Error(`locked: ${path}`)
      if (!(path in files)) throw new Error(`file not found: ${path}`)
      return files[path]
    },
    readdirSync: (dir) => {
      if (dir === root) {
        const names = new Set()
        for (const key of Object.keys(files)) names.add(key.slice(root.length + 1).split('/')[0])
        return [...names]
      }
      if (dirs.has(dir)) {
        const prefix = `${dir}/`
        const names = new Set()
        for (const key of Object.keys(files)) {
          if (key.startsWith(prefix)) names.add(key.slice(prefix.length).split('/')[0])
        }
        return [...names]
      }
      throw new Error(`not a directory: ${dir}`)
    }
  }
}
