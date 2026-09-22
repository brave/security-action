import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import installOpengrep, { OPENGREP_VERSION } from '../../src/installOpengrep.js'

const HOME = '/home/tester'
const BIN = `${HOME}/.opengrep/cli/latest/opengrep`
const DIST = 'opengrep_manylinux_x86'
// sha256 of the fake binary content written by the exec seam
const BIN_SHA = crypto.createHash('sha256').update('binary').digest('hex')
const BIN_PINS = (digest) => ({ [OPENGREP_VERSION]: { [DIST]: digest } })

After(function () {
  if (this.savedGithubPath !== undefined) {
    if (this.savedGithubPath === null) delete process.env.GITHUB_PATH
    else process.env.GITHUB_PATH = this.savedGithubPath
    this.savedGithubPath = undefined
  }
})

Given('the pinned opengrep version is already installed', function () {
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  this.execRoutes = [{ test: /--version/, out: `opengrep ${OPENGREP_VERSION.replace('v', '')}` }]
})

Given('opengrep {string} is already installed', function (version) {
  // An outdated version reports itself; the reuse path must not trigger.
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  this.execRoutes = [{ test: /--version/, out: `opengrep ${version.replace('v', '')}` }]
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

Given('the installed binary does not match the pinned digest', function () {
  this.tamperedBin = true
})

Given('no binary digest is pinned', function () {
  this.noBinSha = true
})

Given('GITHUB_PATH is set', function () {
  this.savedGithubPath = process.env.GITHUB_PATH ?? null
  process.env.GITHUB_PATH = `${HOME}/github-path`
})

When('installing opengrep', async function () {
  this.fsx = this.fsx || this.makeMockFs({})
  // Simulate install.sh writing the binary on successful execution, so the
  // post-install hash verification has a file to inspect.
  this.exec = this.makeMockExec((command) => {
    const out = (() => {
      for (const route of this.execRoutes || []) {
        if (route.test.test(command)) {
          if (route.throws) throw new Error(route.out)
          return route.out
        }
      }
      return ''
    })()
    if (/^bash "/.test(command) && !this.fsx.existsSync(BIN)) this.fsx.writeFileSync(BIN, 'binary')
    return out
  })
  this.download = this.downloadFailure
    ? this.makeMockDownload('', { fail: this.downloadFailure })
    : this.makeMockDownload(this.scriptContent || 'x')
  await this.attempt(() => installOpengrep({
    _exec: this.exec,
    _download: this.download,
    _fs: this.fsx,
    _binPath: BIN,
    _expectedSha256: this.wrongHash ? null : (this.scriptSha || null),
    _dist: DIST,
    _binSha256: this.noBinSha ? {} : BIN_PINS(this.tamperedBin ? '0'.repeat(64) : BIN_SHA)
  }))
})

Then('the install script is not executed', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(!commands.some(c => c.startsWith('bash ')), `unexpected bash execution: ${commands.join(' | ')}`)
})

Then('the install script is executed with the pinned version', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(commands.some(c => c.startsWith('bash "') && c.endsWith(` -v ${OPENGREP_VERSION}`)),
    `expected pinned version execution: ${commands.join(' | ')}`)
})

Then('the action fails with no pinned binary digest', function () {
  const expected = `No pinned SHA256 digest for opengrep ${OPENGREP_VERSION} on ${DIST}. ` +
    'Add it to OPENGREP_BIN_SHA256 in src/installOpengrep.js (or run src/updateOpengrepVersion.js).'
  assert.ok(this.error, 'expected the action to fail')
  assert.equal(this.error.message, expected)
})

Then('the temporary script is cleaned up', function () {
  assert.equal(this.fsx.__recorder.count('unlinkSync'), 1)
})

Then('no download happens', function () {
  assert.equal(this.download.__recorder.count('download'), 0)
})

Then('the installed binary is hash checked', function () {
  const reads = this.fsx.__recorder.paramsOf('readFileSync').map(p => p.path)
  assert.ok(reads.includes(BIN), `expected the binary at ${BIN} to be hash checked, reads: ${reads.join(' | ')}`)
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
