import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import { spawnSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const WRAPPER = path.resolve('scripts/with-sandbox.sh')

/**
 * Real-script scenarios: the wrapper is spawned with an env pointing at a
 * stub landrun binary and a stand-in /sys/kernel/security/lsm file. The stub
 * records its argv to $LANDRUN_STUB_LOG and execs the command after "--" so
 * passthrough behaviour is observable.
 */

function stubLandrun (dir) {
  // dir is a per-scenario test tempdir, never user input — no traversal risk.
  const bin = path.join(dir, 'landrun-stub') // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const log = path.join(dir, 'landrun-args.log') // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  fs.writeFileSync(bin, [
    '#!/usr/bin/env bash',
    'printf \'%s\\n\' "$@" >> "$LANDRUN_STUB_LOG"',
    'while [ $# -gt 0 ] && [ "$1" != "--" ]; do shift; done',
    'shift',
    'exec "$@"'
  ].join('\n'), { mode: 0o755 })
  return { bin, log }
}

function runWrapper (world, args) {
  const env = {
    ...process.env,
    LANDRUN_BIN: world.landrunBin,
    SANDBOX_LSM_PATH: world.lsmPath,
    LANDRUN_STUB_LOG: world.stubLog,
    CI: world.ci ? 'true' : ''
  }
  const res = spawnSync(WRAPPER, args, { env, encoding: 'utf-8' })
  world.rc = res.status
  world.stdout = res.stdout || ''
  world.stderr = res.stderr || ''
}

function splitArgs (str) {
  return str.split(' ').filter(Boolean)
}

Given('a sandbox test area', function () {
  this.area = fs.mkdtempSync(path.join(os.tmpdir(), 'sandbox-feature-'))
  this.tmpdir = fs.mkdtempSync(path.join(this.area, 'rw-'))
  this.lsmPath = null
  this.ci = false
  this.cmdScript = null
  this.landrunBin = null
  this.stubLog = null
})

Given('the landrun stub is available', function () {
  const { bin, log } = stubLandrun(this.area)
  this.landrunBin = bin
  this.stubLog = log
})

Given('no landrun binary is available', function () {
  this.landrunBin = path.join(this.area, 'missing-landrun')
  this.stubLog = path.join(this.area, 'landrun-args.log')
})

Given(/the kernel LSM list (includes|does not include|is unavailable)/, function (mode) {
  const lsm = path.join(this.area, 'lsm')
  if (mode === 'includes') {
    fs.writeFileSync(lsm, 'capability landlock yama bpf\n')
  } else if (mode === 'does not include') {
    fs.writeFileSync(lsm, 'capability yama bpf\n')
  } else {
    // unavailable: point the wrapper at a path that does not exist
    this.lsmPath = path.join(this.area, 'no-such-lsm')
    return
  }
  this.lsmPath = lsm
})

Given('the wrapper runs in CI', function () {
  this.ci = true
})

Given('the wrapper runs locally', function () {
  this.ci = false
})

Given('a command script exiting with {int}', function (code) {
  this.cmdScript = path.join(this.area, 'exit-script.sh')
  fs.writeFileSync(this.cmdScript, `#!/usr/bin/env bash\nexit ${code}\n`, { mode: 0o755 })
})

When('running the wrapper with landrun args {string} and command {string}', function (landrunArgs, command) {
  runWrapper(this, splitArgs(landrunArgs).concat('--', splitArgs(command)))
})

When('running the wrapper with landrun args {string}', function (landrunArgs) {
  assert.ok(this.cmdScript, 'command script required')
  runWrapper(this, splitArgs(landrunArgs).concat('--', this.cmdScript))
})

Then(/the exit code is (\d+)/, function (code) {
  assert.equal(this.rc, Number(code), `exit code mismatch, stderr: ${this.stderr}`)
})

Then('stderr mentions {string}', function (needle) {
  assert.ok(this.stderr.includes(needle), `expected stderr to mention "${needle}", got: ${this.stderr}`)
})

Then('the command output is {string}', function (expected) {
  assert.ok(this.stdout.includes(expected), `expected stdout "${expected}", got: ${this.stdout}`)
})

Then('the command was not executed', function () {
  assert.ok(!fs.existsSync(this.stubLog), 'unexpected landrun stub invocation')
})

Then('landrun was invoked with {string} as its first argument', function (expected) {
  const lines = fs.readFileSync(this.stubLog, 'utf-8').split('\n').filter(Boolean)
  assert.equal(lines[0], expected, `first landrun arg: ${lines[0]}`)
})

Then('landrun received the wrapper args and the command', function () {
  const lines = fs.readFileSync(this.stubLog, 'utf-8').split('\n').filter(Boolean)
  const dd = lines.indexOf('--')
  assert.ok(dd > 0, `expected "--" in landrun args: ${lines.join(' ')}`)
  assert.ok(lines[dd + 1].length > 0, 'expected a command after --')
})
