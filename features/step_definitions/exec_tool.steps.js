import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { createExecTool } from '../../src/triage/execTool.js'
import { createToolRegistry } from '../../src/triage/harness/tools.js'

function makeFakeSpawn () {
  const state = {
    calls: [],
    spawnError: null,
    neverExits: false,
    killed: null
  }
  state.spawn = (cmd, args, opts) => {
    const call = { cmd, args, opts, stdout: [], stderr: [], closeCb: null, killed: null }
    state.calls.push(call)
    if (state.spawnError) {
      const err = new Error(state.spawnError)
      err.code = 'ENOENT'
      throw err
    }
    const child = {
      stdout: { on: (_e, cb) => call.stdout.push(cb) },
      stderr: { on: (_e, cb) => call.stderr.push(cb) },
      kill: (sig) => {
        call.killed = sig
        state.killed = sig
        if (call.closeCb) call.closeCb(1)
      },
      on: (event, cb) => {
        if (event === 'error' && state.spawnError) cb(new Error(state.spawnError))
        if (event === 'close') {
          if (state.neverExits) { call.closeCb = cb; return }
          call.stdout.forEach((cb2) => cb2('stdout: listing\n'))
          call.stderr.forEach((cb2) => cb2('stderr: missing\n' + 'y'.repeat(5000)))
          const code = 3
          cb(code)
        }
      }
    }
    return child
  }
  return state
}

Given('a repo workspace at {string} with action root {string}', function (repo, action) {
  this.params.repoRoot = repo
  this.params.actionPath = action
  this.params.scratchDir = '/tmp/scratch'
})

Given('an exec tool with a fake spawn', function () {
  this.execState = makeFakeSpawn()
  const execFn = createExecTool({
    repoRoot: this.params.repoRoot,
    actionPath: this.params.actionPath,
    scratchDir: this.params.scratchDir,
    timeoutMs: 50,
    maxOutputChars: 2000,
    spawnImpl: this.execState.spawn
  })
  this.registry = createToolRegistry({
    root: this.params.repoRoot,
    fsi: { readFileSync: () => { throw new Error('not available') }, readdirSync: () => [] },
    exec: execFn
  })
})

Given('the process environment carries a secret token', function () {
  process.env.OPENROUTER_API_KEY = 'sk-test-secret'
})

When('the exec tool runs with a command that hangs', async function () {
  this.execState.neverExits = true
  this.params.toolResult = await this.registry.run('exec', { command: 'sleep 999' })
})

When('the exec tool runs with a command that fails to spawn', async function () {
  this.execState.spawnError = 'spawn missing-shell ENOENT'
  this.params.toolResult = await this.registry.run('exec', { command: 'echo hi' })
})

Then('the spawned command contains {string}', function (needle) {
  const call = this.execState.calls[0]
  assert.ok(call, 'expected a spawn call')
  const full = `${call.cmd} ${call.args.join(' ')}`
  assert.ok(full.includes(needle), `expected spawn command to contain ${needle}\n${full}`)
})

Then('the spawned command does not contain {string}', function (needle) {
  const call = this.execState.calls[0]
  const full = `${call.cmd} ${call.args.join(' ')}`
  assert.ok(!full.includes(needle), `expected spawn command NOT to contain ${needle}`)
})

Then('the spawned env has exactly the keys {string}', function (keys) {
  const env = Object.keys(this.execState.calls[0].opts.env)
  assert.deepEqual(env.sort(), keys.split(',').sort())
})

Then('the spawned env does not contain the secret token', function () {
  const env = JSON.stringify(this.execState.calls[0].opts.env)
  assert.ok(!env.includes('sk-test-secret'))
  delete process.env.OPENROUTER_API_KEY
})

Then('the spawned cwd is {string}', function (cwd) {
  assert.equal(this.execState.calls[0].opts.cwd, cwd)
})

Then('the child was killed with {string}', function (signal) {
  assert.equal(this.execState.killed, signal)
})

Then('no child was spawned', function () {
  assert.equal(this.execState.calls.length, 0)
})

Then('the tool fails with error containing {string}', function (needle) {
  const res = this.params.toolResult
  assert.equal(res.ok, false)
  assert.ok(res.error.includes(needle), `expected error to contain ${needle}, got ${res.error}`)
})

Then('the tool output length is {int}', function (len) {
  assert.equal(this.params.toolResult.output.length, len)
})
