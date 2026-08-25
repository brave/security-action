import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import opengrepCompare from '../../src/opengrepCompare.js'

function buildExec (world) {
  return world.makeMockExec((command) => {
    for (const route of world.execRoutes) {
      if (route.consumed) continue
      if (route.test.test(command)) {
        if (route.once) route.consumed = true
        if (route.throws) throw new Error(route.out)
        return route.out
      }
    }
    return ''
  })
}

Given('a local target scan of {string}', function (target) {
  this.options = { 'local-target': target }
  this.execRoutes = []
})

Given('git reports no changed rule files', function () {
  this.execRoutes.push({ test: /git diff --name-only/, out: '' })
})

Given('git diff fails with {string}', function (message) {
  this.execRoutes.push({ test: /git diff --name-only/, out: message, throws: true })
})

Given('git reports one changed rule file that exists in the base branch', function () {
  this.execRoutes.push({ test: /git diff --name-only/, out: 'assets/opengrep_rules/client/foo.yaml' })
  this.execRoutes.push({ test: /test -f /, out: '' })
})

Given('git reports one new rule file that is missing in the base branch', function () {
  this.execRoutes.push({ test: /git diff --name-only/, out: 'assets/opengrep_rules/client/new-rule.yaml' })
  this.execRoutes.push({ test: /test -f /, out: 'file not found', throws: true })
})

Given('creating the current worktree fails with {string}', function (message) {
  this.execRoutes.push({ test: /git worktree add .* HEAD/, out: message, throws: true })
})

Given('creating the base worktree fails with {string}', function (message) {
  this.execRoutes.push({ test: /git worktree add .* origin\/main/, out: message, throws: true })
  this.execRoutes.push({ test: /git fetch origin main/, out: '' })
})

Given('creating the base worktree fails once before a fetch', function () {
  this.execRoutes.push({ test: /git worktree add .* origin\/main/, out: 'not fetched yet', throws: true, once: true })
  this.execRoutes.push({ test: /git fetch origin main/, out: '' })
})

Given('the base opengrep scan reports findings', function (json) {
  this.execRoutes.push({ test: /cd .*opengrep-rules-base.*opengrep/, out: json })
})

Given('the current opengrep scan reports findings', function (json) {
  this.execRoutes.push({ test: /cd .*opengrep-rules-current.*opengrep/, out: json })
})

Given('the base opengrep scan outputs garbage', function () {
  this.execRoutes.push({ test: /cd .*opengrep-rules-base.*opengrep/, out: 'NOT JSON {{{' })
})

Given('the current opengrep scan outputs garbage', function () {
  this.execRoutes.push({ test: /cd .*opengrep-rules-current.*opengrep/, out: 'NOT JSON {{{' })
})

Given('rule discovery finds rule files on both branches', function () {
  this.execRoutes.push({ test: /find .*opengrep-rules-base/, out: '/tmp/base-rules/client/foo.yaml\n/tmp/base-rules/client/bar.yaml' })
  this.execRoutes.push({ test: /find .*opengrep-rules-current/, out: '/tmp/current-rules/client/foo.yaml\n/tmp/current-rules/client/bar.yaml' })
})

Given('the target repository {string} is cloned', function (repo) {
  delete this.options['local-target']
  this.options['target-repo'] = repo
  this.execRoutes.push({
    test: /mkdir -p (.+)$/,
    out: ''
  })
  this.execRoutes.push({ test: /git clone --depth 1/, out: '' })
  this.execRoutes.push({ test: /rev-parse --abbrev-ref HEAD/, out: 'main' })
})

Given('the base opengrep scan reports findings under the clone', function (json) {
  const world = this
  this.execRoutes.push({
    test: /cd .*opengrep-rules-base.*opengrep/,
    get out () { return json.split('<CLONE>').join(world.clonedDir || '') }
  })
})

Given('the current opengrep scan reports findings under the clone', function (json) {
  const world = this
  this.execRoutes.push({
    test: /cd .*opengrep-rules-current.*opengrep/,
    get out () { return json.split('<CLONE>').join(world.clonedDir || '') }
  })
})

When('comparing rules', async function () {
  const exec = buildExec(this)
  // Capture the clone directory from the mkdir command for path stripping
  const rawExec = exec
  const wrapped = (command, options) => {
    if (/^mkdir -p /.test(command)) this.clonedDir = command.replace('mkdir -p ', '')
    return rawExec(command, options)
  }
  wrapped.__recorder = exec.__recorder
  this.exec = wrapped
  await this.attempt(() => opengrepCompare({ ...this.options, _exec: wrapped }))
})

When('comparing rules with rule comparison disabled', async function () {
  const exec = buildExec(this)
  this.exec = exec
  await this.attempt(() => opengrepCompare({ ...this.options, 'compare-rules': false, _exec: exec }))
})

When('comparing rules with changed-rules-only disabled', async function () {
  const exec = buildExec(this)
  this.exec = exec
  await this.attempt(() => opengrepCompare({ ...this.options, 'changed-rules-only': false, _exec: exec }))
})

Then('the result has no changes', function () {
  assert.equal(this.result.noChanges, true)
})

Then('the result has no delta', function () {
  assert.equal(this.result.delta, null)
})

Then('the result reports {int} total findings', function (count) {
  assert.equal(this.result.total, count)
})

Then('the result reports {int} rules triggered', function (count) {
  assert.equal(this.result.rules, count)
})

Then('the delta lists {int} new rule', function (count) {
  assert.equal(this.result.delta.newRules.length, count)
})

Then('the delta lists {int} new rules', function (count) {
  assert.equal(this.result.delta.newRules.length, count)
})

Then('the delta lists {int} new finding', function (count) {
  const total = Object.values(this.result.delta.newFindings).flat().length
  assert.equal(total, count)
})

Then('the delta lists {int} new findings', function (count) {
  const total = Object.values(this.result.delta.newFindings).flat().length
  assert.equal(total, count)
})

Then('the delta lists {int} removed finding', function (count) {
  const total = Object.values(this.result.delta.removedFindings).flat().length
  assert.equal(total, count)
})

Then('the delta lists {int} removed findings', function (count) {
  const total = Object.values(this.result.delta.removedFindings).flat().length
  assert.equal(total, count)
})

Then('the percentage increase is {float}', function (value) {
  assert.equal(this.result.percentageIncrease, value)
})

Then('the base total is {int}', function (count) {
  assert.equal(this.result.baseTotal, count)
})

Then('the base total is unknown', function () {
  assert.equal(this.result.baseTotal, null)
})

Then('the base branch is fetched', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(commands.includes('git fetch origin main'), `expected a fetch, got: ${commands.join(' | ')}`)
})

Then('git diff is never called', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(!commands.some(c => c.includes('git diff')), `git diff was called: ${commands.join(' | ')}`)
})

Then('the target repo default branch is {string}', function (branch) {
  assert.equal(this.result.targetRepoDefaultBranch, branch)
})

Then('the worktrees are cleaned up', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  const removals = commands.filter(c => c.includes('git worktree remove'))
  assert.equal(removals.length, 2, `expected 2 worktree removals, got: ${commands.join(' | ')}`)
})

Then('the target repository clone is removed', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(commands.some(c => c.startsWith('rm -rf ')), 'expected the clone directory to be removed')
})

Then('the finding path for rule {string} is {string}', function (ruleId, expectedPath) {
  const findings = this.result.findings[ruleId]
  assert.ok(findings, `no findings for rule ${ruleId}`)
  assert.equal(findings[0].path, expectedPath)
})
