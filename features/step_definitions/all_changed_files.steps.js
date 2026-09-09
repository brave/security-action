import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import filterExistingFiles from '../../src/filterExistingFiles.js'

Given('a workspace containing the files {string}', function (filesCsv) {
  this.workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'secact-ws-'))
  for (const file of filesCsv.split(',')) {
    const target = path.join(this.workspaceRoot, file)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, 'x')
  }
})

When('filtering the changed files {string}', function (filesCsv) {
  this.dropped = null
  this.result = filterExistingFiles(filesCsv.split(','), {
    workspaceRoot: this.workspaceRoot,
    onDropped: (missing) => { this.dropped = missing }
  })
})

When('filtering an empty changed files list', function () {
  this.dropped = null
  this.result = filterExistingFiles([], {
    workspaceRoot: this.workspaceRoot,
    onDropped: (missing) => { this.dropped = missing }
  })
})

When('filtering the changed files {string} against workspace root {string}', function (filesCsv, root) {
  this.dropped = null
  this.result = filterExistingFiles(filesCsv.split(','), {
    workspaceRoot: path.join(this.workspaceRoot, root),
    onDropped: (missing) => { this.dropped = missing }
  })
})

Then('the kept files are {string}', function (filesCsv) {
  const expected = filesCsv === '' ? [] : filesCsv.split(',')
  assert.deepEqual(this.result, expected)
})

Then('the dropped files are {string}', function (filesCsv) {
  assert.deepEqual(this.dropped, filesCsv.split(','))
})

Then('no files are reported as dropped', function () {
  assert.equal(this.dropped, null)
})
