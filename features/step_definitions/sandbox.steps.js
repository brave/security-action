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
  const bin = path.join(dir, 'landrun-stub')
  const log = path.join(dir, 'landrun-args.log')
  // The log path is baked into the stub (SANDBOX_CLEAN_ENV paths must not
  // depend on inherited env). The stub models landrun v0.1.17 faithfully:
  // it records its argv, then logs the child environment it would exec with
  // — everything stripped except --env KEY / --env KEY=VALUE pairs.
  fs.writeFileSync(bin, [
    '#!/usr/bin/env bash',
    `printf '%s\\n' "$@" >> '${log}'`,
    'envs=()',
    'while [ $# -gt 0 ]; do',
    '  if [ "$1" = "--env" ]; then shift',
    '    case "$1" in',
    '      *=*) envs+=("$1") ;;',
    '      *) val="$' + '{!1:-}"; [ -n "$val" ] && envs+=("$1=$val") ;;',
    '    esac',
    '  elif [ "$1" = "--" ]; then shift; break;',
    '  else shift; fi',
    'done',
    `echo __ENV__ >> '${log}'`,
    // eslint-disable-next-line no-template-curly-in-string
    `env -i "PWD=$PWD" ${'${envs[@]+"${envs[@]}"}'} env | LC_ALL=C sort >> '${log}'`,
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
    CI: world.ci ? 'true' : '',
    ...world.extraEnv
  }
  if (world.cleanEnv) env.SANDBOX_CLEAN_ENV = '1'
  const res = spawnSync(WRAPPER, args, { env, encoding: 'utf-8' })
  world.rc = res.status
  world.stdout = res.stdout || ''
  world.stderr = res.stderr || ''
}

function splitArgs (str) {
  return str.split(' ').filter(Boolean)
}

function stubEnvLines (world) {
  const raw = fs.readFileSync(world.stubLog, 'utf-8').split('\n')
  const start = raw.indexOf('__ENV__')
  return raw.slice(start + 1).filter(Boolean)
}

Given('a sandbox test area', function () {
  this.area = fs.mkdtempSync(path.join(os.tmpdir(), 'sandbox-feature-'))
  this.tmpdir = fs.mkdtempSync(path.join(this.area, 'rw-'))
  this.lsmPath = null
  this.ci = false
  this.cmdScript = null
  this.landrunBin = null
  this.stubLog = null
  this.extraEnv = {}
  this.cleanEnv = false
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

Given(/the sandboxed environment is scrubbed/, function () {
  this.cleanEnv = true
})

Given(/the environment variable "([^"]*)" is "([^"]*)"/, function (name, value) {
  this.extraEnv = this.extraEnv || {}
  this.extraEnv[name] = value
})

Then(/the sandboxed environment does not include "([^"]*)"/, function (name) {
  const present = stubEnvLines(this).some(line => line.startsWith(`${name}=`))
  assert.ok(!present, `expected ${name} to be scrubbed, got: ${stubEnvLines(this).join(' ')}`)
})

Then(/the sandboxed environment includes "([^"]*)" with value "([^"]*)"/, function (name, value) {
  const lines = stubEnvLines(this)
  assert.ok(lines.includes(`${name}=${value}`), `expected ${name}=${value} in: ${lines.join(' | ')}`)
})
