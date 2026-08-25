import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import updateOpengrepVersion from '../../src/updateOpengrepVersion.js'

const INSTALL_SCRIPT = fileURLToPath(new URL('../../src/installOpengrep.js', import.meta.url))

function installScriptContent (version) {
  return `const OPENGREP_VERSION = '${version}'\nconst EXPECTED_SHA256 = '${'a'.repeat(64)}'\n`
}

Given('the installed version is {string}', function (version) {
  this.fsx = this.makeMockFs({ [INSTALL_SCRIPT]: installScriptContent(version) })
})

Given('the installed version cannot be parsed', function () {
  this.fsx = this.makeMockFs({ [INSTALL_SCRIPT]: '// no version constant here\n' })
})

Given('the latest release is {string}', function (version) {
  this.release = { tag_name: version }
})

Given('the release fetch fails with {string}', function (message) {
  this.fetchFailure = message
})

Given('the pinned script downloads {int} bytes', function (bytes) {
  this.downloadContent = 'x'.repeat(bytes)
})

Given('the pinned script download fails with {string}', function (message) {
  this.downloadFailure = message
})

When('updating the opengrep version', async function () {
  this.fsx = this.fsx || this.makeMockFs({ [INSTALL_SCRIPT]: installScriptContent('v1.11.5') })
  this.fetchRelease = async () => {
    if (this.fetchFailure) throw new Error(this.fetchFailure)
    return this.release || { tag_name: 'v1.11.5' }
  }
  this.download = this.downloadFailure
    ? this.makeMockDownload('', { fail: this.downloadFailure })
    : this.makeMockDownload(this.downloadContent || 'NEW_SCRIPT')
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

Then('the file pins the downloaded script hash', function () {
  const content = this.fsx.__files[INSTALL_SCRIPT]
  const sha = crypto.createHash('sha256').update(Buffer.from(this.downloadContent)).digest('hex')
  assert.ok(content.includes(`const EXPECTED_SHA256 = '${sha}'`), `${content} lacks hash ${sha}`)
})
