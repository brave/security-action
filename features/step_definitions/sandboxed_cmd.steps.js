import { Given, Then } from '@cucumber/cucumber'
import assert from 'assert'
import buildSandboxedCmd from '../../src/sandboxedCmd.js'

Given('a sandboxed command for action path {string} cmd {string} with write dirs [{string}] and egress {word}', function (actionPath, cmd, writeDirs, egress) {
  this.sandboxedCmd = buildSandboxedCmd({
    actionPath,
    cmd,
    writeDirs: writeDirs === '' ? [] : [writeDirs],
    egress: egress === 'on'
  })
})

Given('a sandboxed command for action path {string} cmd {string} with write dirs [] and egress {word}', function (actionPath, cmd, egress) {
  this.sandboxedCmd = buildSandboxedCmd({ actionPath, cmd, writeDirs: [], egress: egress === 'on' })
})

Given('a sandboxed command for action path {string} cmd {string} with write dirs [{string}, {string}] and egress {word}', function (actionPath, cmd, first, second, egress) {
  this.sandboxedCmd = buildSandboxedCmd({
    actionPath,
    cmd,
    writeDirs: [first, second],
    egress: egress === 'on'
  })
})

Given('the read dirs [{string}, {string}]', function (first, second) {
  this.sandboxedCmd = buildSandboxedCmd({
    actionPath: '/act',
    cmd: 'opengrep --json .',
    writeDirs: ['/home/u/.cache/opengrep', '/home/u/.opengrep/semgrep.log'],
    readDirs: [first, second],
    egress: false
  })
})

Then('the command runs inside the sandbox wrapper', function () {
  const cmd = this.sandboxedCmd
  assert.ok(cmd.includes('scripts/with-sandbox.sh'), `no wrapper in:\n${cmd}`)
  assert.ok(cmd.includes('--ignore-missing'), `no ignore-missing in:\n${cmd}`)
  assert.ok(cmd.includes('--ro "/act"'), `action tree not read-only in:\n${cmd}`)
})

Then('the action tree is read-only', function () {
  assert.ok(this.sandboxedCmd.includes('--ro "/act"'), `action tree not read-only in:\n${this.sandboxedCmd}`)
})

Then('the action tree is read-only and git metadata writable', function () {
  const cmd = this.sandboxedCmd
  assert.ok(cmd.includes('--rwx "/act/.git"'), `.git not writable in:\n${cmd}`)
})

Then('the target is writable and TLS 443 is the only egress', function () {
  const cmd = this.sandboxedCmd
  assert.ok(cmd.includes('--rwx "/tmp/scan"'), `target not writable in:\n${cmd}`)
  assert.ok(cmd.includes('--connect-tcp 443'), `no 443 egress in:\n${cmd}`)
  assert.ok(!/--connect-tcp\s+\d+/.test(cmd.replace(/--connect-tcp 443/g, '')), `unexpected extra egress in:\n${cmd}`)
  assert.ok(!cmd.includes('--bind-tcp'), `bind grant in:\n${cmd}`)
})

Then('no egress is granted', function () {
  const cmd = this.sandboxedCmd
  assert.ok(!cmd.includes('--connect-tcp'), `unexpected egress grant in:\n${cmd}`)
  assert.ok(!cmd.includes('--bind-tcp'), `bind grant in:\n${cmd}`)
  assert.ok(!cmd.includes('--unrestricted-network'), `unrestricted network in:\n${cmd}`)
})

Then('the payload is wrapped in bash -c', function () {
  const cmd = this.sandboxedCmd
  assert.ok(cmd.includes('-- bash -c '), `payload not wrapped in bash -c:\n${cmd}`)
})

Then('single quotes inside the payload are escaped', function () {
  const cmd = this.sandboxedCmd
  // cmd.replace(/'/g, `'\\''`) produces the '\'' escape sequence
  assert.ok(cmd.includes('\'\\\'\''), `single quotes not escaped in:\n${cmd}`)
})

Then('the cache paths are writable and the read dirs are read-only', function () {
  const cmd = this.sandboxedCmd
  assert.ok(cmd.includes('--rwx "/home/u/.cache/opengrep"'), `cache not writable in:\n${cmd}`)
  assert.ok(cmd.includes('--rwx "/home/u/.opengrep/semgrep.log"'), `log not writable in:\n${cmd}`)
  assert.ok(cmd.includes('--ro "/rules"'), `rules not read-only in:\n${cmd}`)
  assert.ok(cmd.includes('--ro "/scan-target"'), `scan target not read-only in:\n${cmd}`)
})
