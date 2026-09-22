import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import installOpengrep, { OPENGREP_VERSION, OPENGREP_BIN_SHA256 } from '../../src/installOpengrep.js'

const HOME = '/home/tester'
const BIN = `${HOME}/.opengrep/cli/latest/opengrep`
const INST_DIR = `${HOME}/.opengrep/cli/${OPENGREP_VERSION}`
const INST_BIN = `${INST_DIR}/opengrep`
const DIST = 'opengrep_manylinux_x86'
const AARCH64_DIST = 'opengrep_manylinux_aarch64'
const RELEASE_URL = `https://github.com/opengrep/opengrep/releases/download/${OPENGREP_VERSION}/${DIST}`
// sha256 of the fake binary content the download seam returns
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
  // Scoped to the existing (latest) binary so the freshly installed
  // binary's smoke probe hits the default pinned-version route instead.
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  this.execRoutes = [{ test: /cli\/latest\/opengrep" --version/, out: `opengrep ${version.replace('v', '')}` }]
})

Given('no opengrep binary is installed', function () {
  this.execRoutes = []
})

Given('the opengrep binary exists but --version fails', function () {
  this.fsx = this.makeMockFs({ [BIN]: 'binary' })
  // Only the existing (latest) binary fails the version probe; the freshly
  // installed binary answers with the pinned version via the default route.
  this.execRoutes = [{ test: /cli\/latest\/opengrep" --version/, out: 'version check exploded', throws: true }]
})

Given('the pinned release asset downloads {int} bytes', function (bytes) {
  this.assetContent = 'x'.repeat(bytes)
  this.assetSha = crypto.createHash('sha256').update(Buffer.from(this.assetContent)).digest('hex')
})

Given('the pinned release asset downloads {int} bytes with the wrong hash', function (bytes) {
  this.assetContent = 'x'.repeat(bytes)
  this.wrongHash = true
})

Given('the opengrep asset download fails with {string}', function (message) {
  this.downloadFailure = message
})

Given('the version smoke test fails with {string}', function (message) {
  this.execRoutes = [...(this.execRoutes || []),
    { test: new RegExp(`cli/${OPENGREP_VERSION.replace(/[.]/g, '\\.')}\\/opengrep" --version`), out: message, throws: true }]
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
  this.exec = this.makeMockExec((command) => {
    for (const route of this.execRoutes || []) {
      if (route.test.test(command)) {
        if (route.throws) throw new Error(route.out)
        return route.out
      }
    }
    // Unrouted --version probes (the freshly installed binary's smoke test)
    // answer with the pinned version.
    if (/--version/.test(command)) return `opengrep ${OPENGREP_VERSION.replace('v', '')}`
    return ''
  })
  this.download = this.downloadFailure
    ? this.makeMockDownload('', { fail: this.downloadFailure })
    : this.makeMockDownload(this.assetContent || 'binary')
  await this.attempt(() => installOpengrep({
    _exec: this.exec,
    _download: this.download,
    _fs: this.fsx,
    _binPath: BIN,
    _dist: DIST,
    _binSha256: this.noBinSha ? {} : BIN_PINS(this.tamperedBin ? '0'.repeat(64) : (this.assetSha || BIN_SHA))
  }))
})

Then('no download happens', function () {
  assert.equal(this.download.__recorder.count('download'), 0)
})

Then('no symlink is created', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(!commands.some(c => c.includes('ln -s')), `unexpected symlink creation: ${commands.join(' | ')}`)
})

Then('the binary is downloaded from the pinned release URL', function () {
  const urls = this.download.__recorder.paramsOf('download').map(p => p.url)
  assert.ok(urls.length === 1, `expected exactly one download, got: ${urls.join(' | ')}`)
  assert.equal(urls[0], RELEASE_URL)
})

Then('the opengrep binary is written as executable', function () {
  const mkdirs = this.fsx.__recorder.paramsOf('mkdirSync')
  assert.ok(mkdirs.some(m => m.path === INST_DIR), `expected ${INST_DIR} created, got: ${mkdirs.map(m => m.path).join(' | ')}`)
  const writes = this.fsx.__recorder.paramsOf('writeFileSync')
  assert.ok(writes.length === 1, `expected one binary write, got ${writes.length}`)
  assert.equal(writes[0].path, INST_BIN)
  assert.equal(writes[0].opts.mode, 0o755)
})

Then('the latest symlink points at the version directory', function () {
  const commands = this.exec.__recorder.paramsOf('exec').map(p => p.command)
  assert.ok(
    commands.some(c => c.includes(`ln -sfn "${INST_DIR}"`) && c.includes('/.opengrep/cli/latest')),
    `expected latest symlink command, got: ${commands.join(' | ')}`
  )
})

Then('the installed binary is hash checked', function () {
  const reads = this.fsx.__recorder.paramsOf('readFileSync').map(p => p.path)
  assert.ok(
    reads.includes(BIN) || reads.includes(INST_BIN),
    `expected the binary to be hash checked, reads: ${reads.join(' | ')}`
  )
})

Then('the action fails with no pinned binary digest', function () {
  const expected = `No pinned SHA256 digest for opengrep ${OPENGREP_VERSION} on ${DIST}. ` +
    'Add it to OPENGREP_BIN_SHA256 in src/installOpengrep.js (or run src/updateOpengrepVersion.js).'
  assert.ok(this.error, 'expected the action to fail')
  assert.equal(this.error.message, expected)
})

Then('GITHUB_PATH receives the opengrep directory', function () {
  const appends = this.fsx.__recorder.paramsOf('appendFileSync')
  assert.ok(appends.length === 1, `expected one GITHUB_PATH append, got ${appends.length}`)
  assert.equal(appends[0].path, `${HOME}/github-path`)
  assert.equal(appends[0].content, `${HOME}/.opengrep/cli/latest\n`)
})

Then('the opengrep pins include the aarch64 release asset', function () {
  const digest = OPENGREP_BIN_SHA256[OPENGREP_VERSION][AARCH64_DIST]
  assert.ok(digest && /^[0-9a-f]{64}$/.test(digest), `missing aarch64 pin for ${OPENGREP_VERSION}`)
})
