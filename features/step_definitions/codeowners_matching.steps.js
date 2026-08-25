import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import fs from 'fs'
import os from 'os'
import path from 'path'
import matchCodeowners, {
  findCodeownersPath,
  parseCodeowners,
  patternToRegex,
  findOwners
} from '../../src/matchCodeowners.js'

const LOCATIONS = ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS']

Given('a temporary workspace', function () {
  this.workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'bdd-codeowners-'))
})

After(function () {
  if (this.workspace) {
    fs.rmSync(this.workspace, { recursive: true, force: true })
    this.workspace = null
  }
})

Given('a CODEOWNERS file only at {string}', function (location) {
  for (const loc of LOCATIONS) {
    const stale = path.join(this.workspace, loc)
    fs.rmSync(stale, { force: true })
  }
  const target = path.join(this.workspace, location)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, '* @someone\n')
})

Given('no CODEOWNERS file anywhere', function () {
  for (const loc of LOCATIONS) {
    fs.rmSync(path.join(this.workspace, loc), { force: true })
  }
})

Then('the discovered CODEOWNERS path ends with {string}', function (suffix) {
  const discovered = findCodeownersPath(this.workspace)
  assert.ok(discovered, 'expected a CODEOWNERS path to be discovered')
  assert.ok(discovered.endsWith(suffix), `expected ${discovered} to end with ${suffix}`)
})

Then('no CODEOWNERS path is discovered', function () {
  assert.equal(findCodeownersPath(this.workspace), null)
})

Given('a CODEOWNERS file containing', function (docstring) {
  this.codeownersPath = path.join(this.workspace, 'CODEOWNERS')
  fs.writeFileSync(this.codeownersPath, docstring)
})

Then('parsing yields {int} patterns', function (count) {
  const patterns = parseCodeowners(this.codeownersPath)
  assert.equal(patterns.length, count)
  this.lastPatterns = patterns
})

Then('pattern {int} is {string} with owners {string}', function (index, pattern, owners) {
  const entry = this.lastPatterns[index - 1]
  assert.ok(entry, `expected pattern ${index}`)
  assert.equal(entry[0], pattern)
  assert.deepEqual(entry[1], owners.split(','))
})

Given('the pattern {string}', function (pattern) {
  this.pattern = pattern
})

Then('it matches {string}', function (file) {
  assert.ok(
    patternToRegex(this.pattern).test(file),
    `expected ${this.pattern} to match ${file}`
  )
})

Then('it does not match {string}', function (file) {
  assert.ok(
    !patternToRegex(this.pattern).test(file),
    `expected ${this.pattern} NOT to match ${file}`
  )
})

Given('the patterns', function (table) {
  this.patterns = table.raw().map(row => [row[0], row[1].split(',')])
})

When('finding owners of {string}', function (file) {
  this.owners = findOwners(file, this.patterns)
})

Then('the owners are {string}', function (owners) {
  const expected = owners ? owners.split(',') : []
  assert.deepEqual(this.owners, expected)
})

When('matching changed files', function (table) {
  this.changedFiles = table.raw().map(row => row[0])
  this.matchResult = matchCodeowners({
    changedFiles: this.changedFiles,
    basePath: this.workspace
  })
})

When('matching changed files with debug {string}', function (debug, table) {
  this.changedFiles = table.raw().map(row => row[0])
  const logs = []
  const realLog = console.log
  console.log = (...args) => logs.push(args.join(' '))
  try {
    this.matchResult = matchCodeowners({
      changedFiles: this.changedFiles,
      basePath: this.workspace,
      debug
    })
  } finally {
    console.log = realLog
  }
  this.debugLogs = logs
})

Then('owner {string} owns {string}', function (owner, files) {
  const expected = files.split(',')
  assert.deepEqual(this.matchResult.ownersToFiles[owner], expected)
})

Then('files without owners are {string}', function (files) {
  const expected = files ? files.split(',') : []
  assert.deepEqual(this.matchResult.filesWithoutOwners, expected)
})

Then('the stats report {int} total, {int} with owners, {int} without, {int} unique owners', function (total, withOwners, without, unique) {
  const stats = this.matchResult.stats
  assert.equal(stats.totalFiles, total)
  assert.equal(stats.filesWithOwners, withOwners)
  assert.equal(stats.filesWithoutOwners, without)
  assert.equal(stats.uniqueOwners, unique)
})

Then('the team list is {string}', function (teams) {
  assert.deepEqual(this.matchResult.stats.teamsList, teams.split(',').sort())
})

Then('the individual list is {string}', function (individuals) {
  assert.deepEqual(this.matchResult.stats.individualsList, individuals.split(',').sort())
})

Then('the debug log contains {string}', function (text) {
  assert.ok(
    this.debugLogs.some(line => line.includes(text)),
    `expected debug log to contain ${text}`
  )
})

export { LOCATIONS }
