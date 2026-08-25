import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import installOpengrep from '../../src/installOpengrep.js'

const HOME = '/home/tester'
const BIN = `${HOME}/.opengrep/cli/latest/opengrep`

After(function () {
  if (this.savedGithubPath !== undefined) {
    if (this.savedGithubPath === null) delete process.env.GITHUB_PATH
    else process.env.GITHUB_PATH = this.savedGithubPath
    this.savedGithubPath = undefined
  }
})

Given('opengrep {string} is already installed', function (version) {
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  this.execRoutes = [{ test: /--version/, out: `opengrep ${version}` }]
})

Given('no opengrep binary is installed', function () {
  this.execRoutes = []
})

Given('the opengrep binary exists but --version fails', function () {
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  this.execRoutes = [{ test: /--version/, out: 'version check exploded', throws: true }]
})

Given('the install script downloads {int} bytes', function (bytes) {
  this.scriptContent = 'x'.repeat(bytes)
  this.scriptSha = crypto.createHash('sha256').update(Buffer.from(this.scriptContent)).digest('hex')
})

Given('the install script downloads {int} bytes with the wrong hash', function (bytes) {
  this.scriptContent = 'x'.repeat(bytes)
  this.wrongHash = true
})

Given('the install script download fails with {string}', function (message) {
  this.downloadFailure = message
})

Given('the install script execution fails with {string}', function (message) {
  this.execRoutes = [...(this.execRoutes || []), { test: /^bash "/, out: message, throws: true }]
})

Given('GITHUB_PATH is set', function () {
  this.savedGithubPath = process.env.GITHUB_PATH ?? null
  process.env.GITHUB_PATH = `${HOME}/github-path`
})

When('installing opengrep', async function () {
  this.exec = this.makeMockExec((command) => {
    for (const route of this.execRoutes || []) {
      if (route.test.test(command)) {
        if (route.throws) throw new Error(route.out)
        return route.out
      }
    }
    return ''
  })
  this.fsx = this.fsx || this.makeMockFs({})
  this.download = this.downloadFailure
    ? this.makeMockDownload('', { fail: this.downloadFailure })
    : this.makeMockDownload(this.scriptContent || 'x')
  await this.attempt(() => installOpengrep({
    _exec: this.exec,
    _download: this.download,
    _fs: this.fsx,
    _homedir: () => HOME,
    _expectedSha256: this.wrongHash ? null : (this.scriptSha || null)
  }))
})

Then('the install script is not executed', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(!commands.some(c => c.startsWith('bash ')), `unexpected bash execution: ${commands.join(' | ')}`)
})

Then('the install script is executed with the pinned version', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(commands.some(c => /bash ".*" -v v1\.11\.5/.test(c)), `expected pinned version execution: ${commands.join(' | ')}`)
})

Then('the temporary script is cleaned up', function () {
  assert.equal(this.fsx.__recorder.count('unlinkSync'), 1)
})

Then('no download happens', function () {
  assert.equal(this.download.__recorder.count('download'), 0)
})

Then('the install script is written as executable', function () {
  const writes = this.fsx.__recorder.paramsOf('writeFileSync')
  assert.ok(writes.length > 0, 'expected the install script to be written')
  assert.equal(writes[0].opts.mode, 0o755)
})

Then('GITHUB_PATH receives the opengrep directory', function () {
  const appends = this.fsx.__recorder.paramsOf('appendFileSync')
  assert.ok(appends.length === 1, `expected one GITHUB_PATH append, got ${appends.length}`)
  assert.equal(appends[0].path, `${HOME}/github-path`)
  assert.equal(appends[0].content, `${HOME}/.opengrep/cli/latest\n`)
})
