import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import checkRuleMetadata from '../../src/checkRuleMetadata.js'

function tempDir (prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

Given('a temporary rules directory', function () {
  this.rulesDir = tempDir('bdd-rules-')
})

After(function () {
  if (this.rulesDir) {
    fs.rmSync(this.rulesDir, { recursive: true, force: true })
    this.rulesDir = null
  }
})

Given('a rule file {string}', function (relativePath, docstring) {
  const target = path.join(this.rulesDir, relativePath)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, docstring)
})

Given('the rules directory does not exist', function () {
  this.rulesDir = path.join(tempDir('bdd-rules-gone-'), 'missing')
})

When('checking rule metadata', async function () {
  await this.attempt(() => checkRuleMetadata({
    dirs: ['services'],
    basePath: this.rulesDir,
    exitOnError: false
  }))
})

When('checking rule metadata with exit codes', async function () {
  const originalExit = process.exit
  this.exitCode = null
  process.exit = (code) => {
    this.exitCode = code
  }
  try {
    await this.attempt(() => checkRuleMetadata({
      dirs: ['services'],
      basePath: this.rulesDir
    }))
  } finally {
    process.exit = originalExit
  }
})

Then('the check succeeds', function () {
  assert.ok(!this.error, `unexpected error: ${this.error}`)
  assert.equal(this.result.success, true)
  assert.deepEqual(this.result.errors, [])
})

Then('the check fails with {string}', function (text) {
  assert.equal(this.result.success, false)
  assert.ok(
    this.result.errors.some(err => err.includes(text)),
    `${JSON.stringify(this.result.errors)} lacks ${text}`
  )
})

Then('the process exited with code {int}', function (code) {
  assert.equal(this.exitCode, code)
})
