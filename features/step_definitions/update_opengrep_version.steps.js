import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import updateOpengrepVersion from '../../src/updateOpengrepVersion.js'

const INSTALL_SCRIPT = fileURLToPath(new URL('../../src/installOpengrep.js', import.meta.url))
const ACTION_YML = fileURLToPath(new URL('../../actions/main/action.yml', import.meta.url))
const PINNED_DISTS = ['opengrep_manylinux_x86', 'opengrep_manylinux_aarch64', 'opengrep_osx_arm64']

function pinsBlock (version) {
  const entries = PINNED_DISTS.map(d => `    ${d}: '${'b'.repeat(64)}'`).join(',\n')
  return `// BEGIN opengrep binary pins (managed by updateOpengrepVersion.js)\nconst OPENGREP_BIN_SHA256 = {\n  '${version}': {\n${entries}\n  }\n}\n// END opengrep binary pins\n`
}

function installScriptContent (version, { withPins = true } = {}) {
  return `const OPENGREP_VERSION = '${version}'\n${withPins ? pinsBlock(version) : ''}`
}

function actionYmlContent (version) {
  return `name: Cache opengrep\nuses: actions/cache@x\nkey: opengrep-${version}-\${{ runner.os }}\n`
}

function sha256 (content) {
  return crypto.createHash('sha256').update(Buffer.from(content)).digest('hex')
}

Given('the installed version is {string}', function (version) {
  this.fsx = this.makeMockFs({
    [INSTALL_SCRIPT]: installScriptContent(version),
    [ACTION_YML]: actionYmlContent(version)
  })
})

Given('the installed version cannot be parsed', function () {
  this.fsx = this.makeMockFs({
    [INSTALL_SCRIPT]: `// no version constant here\n${pinsBlock('v1.11.5')}`,
    [ACTION_YML]: actionYmlContent('v1.11.5')
  })
})

Given('the installed version has no binary pins', function () {
  this.fsx = this.makeMockFs({
    [INSTALL_SCRIPT]: installScriptContent('v1.11.5', { withPins: false }),
    [ACTION_YML]: actionYmlContent('v1.11.5')
  })
})

Given('the latest release is {string}', function (version) {
  this.release = { tag_name: version }
})

Given('the release fetch fails with {string}', function (message) {
  this.fetchFailure = message
})

Given('the release binaries download for the pinned dists', function () {
  this.binaries = {
    opengrep_manylinux_x86: 'LINUXBINARY',
    opengrep_manylinux_aarch64: 'ARM64BINARY',
    opengrep_osx_arm64: 'OSXBINARY'
  }
})

Given('the release binary download fails with {string}', function (message) {
  this.binaryFailure = message
})

When('updating the opengrep version', async function () {
  this.fsx = this.fsx || this.makeMockFs({
    [INSTALL_SCRIPT]: installScriptContent('v1.11.5'),
    [ACTION_YML]: actionYmlContent('v1.11.5')
  })
  this.fetchRelease = async () => {
    if (this.fetchFailure) throw new Error(this.fetchFailure)
    return this.release || { tag_name: 'v1.11.5' }
  }
  const routes = [
    ...PINNED_DISTS.map(dist => ({
      match: dist,
      content: this.binaries?.[dist] ?? `BIN-${dist}`,
      fail: this.binaryFailure
    }))
  ]
  this.download = this.makeMockDownload('', { routes })
  await this.attempt(() => updateOpengrepVersion({
    _fetchRelease: this.fetchRelease,
    _download: this.download,
    _fs: this.fsx
  }))
})

Then('the result reports no update', function () {
  assert.equal(this.result.updated, false)
  assert.equal(this.result.currentVersion, 'v1.11.5')
  assert.equal(this.result.latestVersion, 'v1.11.5')
})

Then('the result reports an update from {string} to {string}', function (from, to) {
  assert.equal(this.result.updated, true)
  assert.equal(this.result.oldVersion, from)
  assert.equal(this.result.newVersion, to)
})

Then('the result reports an update with no previous version', function () {
  assert.equal(this.result.updated, true)
  assert.equal(this.result.oldVersion, null)
  assert.equal(this.result.newVersion, 'v1.12.0')
})

Then('the file is not modified', function () {
  assert.equal(this.fsx.__recorder.count('writeFileSync'), 0)
})

Then('the file pins version {string}', function (version) {
  const content = this.fsx.__files[INSTALL_SCRIPT]
  assert.ok(content.includes(`const OPENGREP_VERSION = '${version}'`), `${content} lacks ${version}`)
})

Then('the file pins binary digests for {string}', function (version) {
  const content = this.fsx.__files[INSTALL_SCRIPT]
  assert.ok(content.includes('// BEGIN opengrep binary pins'), 'missing pins block')
  assert.ok(content.includes(`'${version}': {`), `${content} lacks ${version} pins`)
  for (const dist of PINNED_DISTS) {
    const expected = sha256(this.binaries[dist])
    assert.ok(content.includes(`${dist}: '${expected}'`), `${content} lacks ${dist} digest ${expected}`)
  }
})

Then('the cache key pins version {string}', function (version) {
  const content = this.fsx.__files[ACTION_YML]
  assert.ok(content.includes(`key: opengrep-${version}-`), `${content} lacks cache key ${version}`)
})
