import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import installLandrun, { LANDRUN_VERSION } from '../../src/installLandrun.js'

const HOME = '/home/tester'
const BIN = `${HOME}/.landrun/bin/landrun`
const DIST = 'landrun-linux-amd64'
// sha256 of the fake binary content written by the download seam
const BIN_SHA = crypto.createHash('sha256').update('binary').digest('hex')
const BIN_PINS = (digest) => ({ [LANDRUN_VERSION]: { [DIST]: digest } })

After(function () {
  if (this.savedGithubPath !== undefined) {
    if (this.savedGithubPath === null) delete process.env.GITHUB_PATH
    else process.env.GITHUB_PATH = this.savedGithubPath
    this.savedGithubPath = undefined
  }
})

Given('the pinned landrun version is already installed', function () {
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  this.execRoutes = [{ test: /--version/, out: `landrun version ${LANDRUN_VERSION.replace('v', '')}` }]
})

Given('landrun {string} is already installed', function (version) {
  // An outdated version reports itself; the reuse path must not trigger.
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  this.execRoutes = [{ test: /--version/, out: `landrun version ${version}` }]
})

Given('no landrun binary is installed', function () {
  this.execRoutes = []
})

Given('the landrun binary exists but --version fails', function () {
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  this.execRoutes = [{ test: /--version/, out: 'version check exploded', throws: true }]
})

Given('the downloaded landrun reports the pinned version', function () {
  // Version reported by the freshly downloaded binary: used for the
  // post-install sanity check (call 2+), while call 1 keeps the existing
  // stale route (old version or failure) that triggered the reinstall.
  this.freshVersion = `landrun version ${LANDRUN_VERSION.replace('v', '')}`
})

Given('the release asset downloads {string}', function (content) {
  this.assetContent = content
})

Given('the release asset download fails with {string}', function (message) {
  this.downloadFailure = message
})

Given('the installed landrun binary does not match the pinned digest', function () {
  this.tamperedBin = true
})

Given('no landrun binary digest is pinned', function () {
  this.noBinSha = true
})

Given('GITHUB_PATH is set for the landrun install', function () {
  this.savedGithubPath = process.env.GITHUB_PATH ?? null
  process.env.GITHUB_PATH = `${HOME}/github-path`
})

When('installing landrun', async function () {
  this.fsx = this.fsx || this.makeMockFs({})
  let call = 0
  this.exec = this.makeMockExec((command) => {
    const idx = call++
    if (idx === 0) {
      for (const route of this.execRoutes || []) {
        if (route.test.test(command)) {
          if (route.throws) throw new Error(route.out)
          return route.out
        }
      }
    }
    return this.freshVersion || ''
  })
  this.download = this.downloadFailure
    ? this.makeMockDownload('', { fail: this.downloadFailure })
    : this.makeMockDownload(this.assetContent || 'binary')
  await this.attempt(() => installLandrun({
    _exec: this.exec,
    _download: this.download,
    _fs: this.fsx,
    _binPath: BIN,
    _dist: DIST,
    _binSha256: this.noBinSha ? {} : BIN_PINS(this.tamperedBin ? '0'.repeat(64) : BIN_SHA)
  }))
})

Then('the release asset is downloaded', function () {
  assert.ok(this.download.__recorder.count('download') >= 1, 'expected a download')
})

Then('no landrun download happens', function () {
  assert.equal(this.download.__recorder.count('download'), 0)
})

Then('the action fails with no pinned landrun binary digest', function () {
  const expected = `No pinned SHA256 digest for landrun ${LANDRUN_VERSION} on ${DIST}. ` +
    'Add it to LANDRUN_BIN_SHA256 in src/installLandrun.js.'
  assert.ok(this.error, 'expected the action to fail')
  assert.equal(this.error.message, expected)
})

Then('the installed landrun binary is hash checked', function () {
  const reads = this.fsx.__recorder.paramsOf('readFileSync').map(p => p.path)
  assert.ok(reads.includes(BIN), `expected the binary at ${BIN} to be hash checked, reads: ${reads.join(' | ')}`)
})

Then('the binary is written as executable', function () {
  const writes = this.fsx.__recorder.paramsOf('writeFileSync').filter(w => w.path === BIN)
  assert.ok(writes.length > 0, 'expected the binary to be written')
  assert.equal(writes[0].opts.mode, 0o755)
})

Then('the landrun binary reports the pinned version', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(commands.some(c => c.includes(BIN) && c.includes('--version')),
    `expected a --version check: ${commands.join(' | ')}`)
})

Then('the install completes without error', function () {
  assert.ok(!this.error, `expected success, got: ${this.error?.message}`)
})

Then('GITHUB_PATH receives the landrun directory', function () {
  const appends = this.fsx.__recorder.paramsOf('appendFileSync')
  assert.ok(appends.length === 1, `expected one GITHUB_PATH append, got ${appends.length}`)
  assert.equal(appends[0].path, `${HOME}/github-path`)
  assert.equal(appends[0].content, `${HOME}/.landrun/bin\n`)
})
