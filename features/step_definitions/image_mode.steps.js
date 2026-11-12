import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import buildUvSyncCmd from '../../src/uvSyncSandbox.js'
import { MANIFEST_PATH, SYSTEM_BIN_DIR, readImageManifest, lockHashMatches, commandAvailable } from '../../src/systemImage.js'
import { buildGithubScriptShim } from '../../src/shim.js'
import installLandrun, { LANDRUN_VERSION } from '../../src/installLandrun.js'
import installOpengrep, { OPENGREP_VERSION } from '../../src/installOpengrep.js'

const sha = (content) => crypto.createHash('sha256').update(content).digest('hex')

const HOME = '/home/tester'
const LANDRUN_BIN = `${SYSTEM_BIN_DIR}/landrun`
const OPENGREP_BIN = `${SYSTEM_BIN_DIR}/opengrep`
const UV_LOCK = '/act/uv.lock'
const PNPM_LOCK = '/act/pnpm-lock.yaml'

// Fake Octokit constructor: records construction options and exposes the
// rest/paginate/graphql surface github-script injects.
function makeFakeOctokit (world) {
  return class FakeOctokit {
    constructor (opts) {
      world.octokitOpts = opts
      this.rest = {}
      this.paginate = async () => []
      this.graphql = async () => ({})
    }
  }
}

After(function () {
  if (this.savedGithubPath !== undefined) {
    if (this.savedGithubPath === null) delete process.env.GITHUB_PATH
    else process.env.GITHUB_PATH = this.savedGithubPath
    this.savedGithubPath = undefined
  }
})

// --- landrun: image-manifest fixtures ---------------------------------

Given('the system image manifest pins landrun {string}', function (version) {
  this.imageManifest = { landrun_version: version }
  const files = { [MANIFEST_PATH]: JSON.stringify(this.imageManifest) }
  this.fsx = this.makeMockFs(files)
  this.savedGithubPath = process.env.GITHUB_PATH ?? null
  process.env.GITHUB_PATH = `${HOME}/github-path`
})

Given('the system image provides the landrun binary', function () {
  this.fsx.__files[LANDRUN_BIN] = 'binary'
})

Given('the system image provides a tampered landrun binary', function () {
  this.fsx.__files[LANDRUN_BIN] = 'tampered'
})

Then('the baked landrun binary is hash checked', function () {
  const reads = this.fsx.__recorder.paramsOf('readFileSync').map(p => p.path)
  assert.ok(reads.includes(LANDRUN_BIN), `expected ${LANDRUN_BIN} hash check, reads: ${reads.join(' | ')}`)
})

// --- opengrep: image-manifest fixtures --------------------------------

Given('the system image manifest pins opengrep {string}', function (version) {
  this.imageManifest = { opengrep_version: version }
  this.fsx = this.makeMockFs({ [MANIFEST_PATH]: JSON.stringify(this.imageManifest) })
  this.savedGithubPath = process.env.GITHUB_PATH ?? null
  process.env.GITHUB_PATH = `${HOME}/github-path`
})

Given('the system image provides the opengrep binary', function () {
  this.fsx.__files[OPENGREP_BIN] = 'binary'
})

Given('the system image provides a tampered opengrep binary', function () {
  this.fsx.__files[OPENGREP_BIN] = 'tampered'
})

Then('the baked opengrep binary is hash checked', function () {
  const reads = this.fsx.__recorder.paramsOf('readFileSync').map(p => p.path)
  assert.ok(reads.includes(OPENGREP_BIN), `expected ${OPENGREP_BIN} hash check, reads: ${reads.join(' | ')}`)
})

// --- shared -----------------------------------------------------------

Then('GITHUB_PATH is not modified', function () {
  const appends = this.fsx.__recorder.paramsOf('appendFileSync')
  const target = process.env.GITHUB_PATH
  assert.ok(
    !appends.some(a => a.path === target),
    `expected no GITHUB_PATH appends, got: ${JSON.stringify(appends)}`
  )
})

// --- uv offline decision ---------------------------------------------

const UV_LOCK_CONTENT = 'uv-lock-fixture'
const PNPM_LOCK_CONTENT = 'pnpm-lock-fixture'

Given('the system image manifest records the uv lock hash', function () {
  this.imageManifest = { uv_lock_sha256: sha(UV_LOCK_CONTENT) }
  this.fsx = this.makeMockFs({ [MANIFEST_PATH]: JSON.stringify(this.imageManifest) })
})

Given('the action checkout has the matching uv lock hash', function () {
  this.fsx.__files[UV_LOCK] = UV_LOCK_CONTENT
})

Given('the action checkout has a different uv lock hash', function () {
  this.fsx.__files[UV_LOCK] = `${UV_LOCK_CONTENT}-changed`
})

Given('no system image manifest exists', function () {
  this.imageManifest = null
  this.fsx = this.makeMockFs({})
})

Given('the action checkout has a uv lock hash', function () {
  this.fsx.__files[UV_LOCK] = UV_LOCK_CONTENT
})

function uvOffline (world) {
  const manifest = readImageManifest(world.fsx)
  return lockHashMatches({ fsx: world.fsx, manifest, lockPath: UV_LOCK, key: 'uv_lock_sha256' })
}

Then('the uv sync command runs offline', function () {
  const offline = uvOffline(this)
  assert.equal(offline, true, 'expected the uv lock hash to match the manifest')
  const cmd = buildUvSyncCmd({ actionPath: '/act', cwd: '/w', home: HOME, offline })
  assert.ok(cmd.includes(' --offline'), `expected --offline in: ${cmd}`)
})

Then('the uv sync command runs online', function () {
  const offline = uvOffline(this)
  assert.equal(offline, false, 'expected the uv lock hash NOT to match the manifest')
  const cmd = buildUvSyncCmd({ actionPath: '/act', cwd: '/w', home: HOME, offline })
  assert.ok(!cmd.includes('--offline'), `unexpected --offline in: ${cmd}`)
})

// --- pnpm offline decision -------------------------------------------

Given('the system image manifest records the pnpm lock hash', function () {
  this.imageManifest = { pnpm_lock_sha256: sha(PNPM_LOCK_CONTENT) }
  this.fsx = this.makeMockFs({ [MANIFEST_PATH]: JSON.stringify(this.imageManifest) })
})

Given('the action checkout has the matching pnpm lock hash', function () {
  this.fsx.__files[PNPM_LOCK] = PNPM_LOCK_CONTENT
})

Given('the action checkout has a different pnpm lock hash', function () {
  this.fsx.__files[PNPM_LOCK] = `${PNPM_LOCK_CONTENT}-changed`
})

Then('the pnpm offline decision is true', function () {
  const manifest = readImageManifest(this.fsx)
  const decision = lockHashMatches({ fsx: this.fsx, manifest, lockPath: PNPM_LOCK, key: 'pnpm_lock_sha256' })
  assert.equal(decision, true, 'expected the pnpm lock hash to match the manifest')
})

Then('the pnpm offline decision is false', function () {
  const manifest = readImageManifest(this.fsx)
  const decision = lockHashMatches({ fsx: this.fsx, manifest, lockPath: PNPM_LOCK, key: 'pnpm_lock_sha256' })
  assert.equal(decision, false, 'expected the pnpm lock hash NOT to match the manifest')
})

// --- xmllint gate -----------------------------------------------------

Given('xmllint is available on PATH', function () {
  this.envForCommand = { PATH: `/usr/bin:${SYSTEM_BIN_DIR}` }
  this.fsx = this.makeMockFs({ [`${SYSTEM_BIN_DIR}/xmllint`]: 'bin' })
})

Given('xmllint is not available on PATH', function () {
  this.envForCommand = { PATH: '/usr/bin:/bin' }
  this.fsx = this.makeMockFs({})
})

Then('the xmllint apt install is skipped', function () {
  assert.equal(commandAvailable('xmllint', { env: this.envForCommand, fsx: this.fsx }), true)
})

Then('the xmllint apt install is required', function () {
  assert.equal(commandAvailable('xmllint', { env: this.envForCommand, fsx: this.fsx }), false)
})

// --- shim (github-script surface) -------------------------------------

const EVENT_FILE = '/tmp/event-payload.json'
const OUTPUT_FILE = '/tmp/github-output'

Given('a runner environment with repository {string} and event {string}', function (repo, eventName) {
  this.shimEnv = {
    GITHUB_REPOSITORY: repo,
    GITHUB_EVENT_NAME: eventName,
    GITHUB_ACTOR: 'tester',
    GITHUB_SHA: 'deadbeef',
    GITHUB_REF: 'refs/heads/main',
    GITHUB_EVENT_PATH: EVENT_FILE,
    GITHUB_OUTPUT: OUTPUT_FILE
  }
  this.shimFs = this.makeMockFs({})
  this.shimLog = []
})

Given('an event payload file describing pull request {int}', function (number) {
  this.shimFs.__files[EVENT_FILE] = JSON.stringify({
    issue: { number },
    pull_request: { number, html_url: `https://github.com/x/y/pull/${number}` }
  })
})

Given('an event payload file without an issue', function () {
  this.shimFs.__files[EVENT_FILE] = JSON.stringify({
    pull_request: { number: 42, html_url: 'https://github.com/x/y/pull/42' }
  })
})

Given('no GITHUB_OUTPUT file is configured', function () {
  delete this.shimEnv.GITHUB_OUTPUT
})

Given('a GITHUB_TOKEN of {string}', function (token) {
  this.shimEnv.GITHUB_TOKEN = token
})

When('the shim builds the github-script surface', async function () {
  this.fakeOctokit = makeFakeOctokit(this)
  await this.attempt(async () => {
    this.shimResult = await buildGithubScriptShim({
      env: this.shimEnv,
      fsx: this.shimFs,
      log: (...args) => this.shimLog.push(args.join(' ')),
      actionPath: '/act',
      OctokitClass: this.fakeOctokit
    })
  })
})

Then('the context repo is {string}', function (repo) {
  const [owner, name] = repo.split('/')
  assert.deepEqual(this.shimResult.context.repo, { owner, repo: name })
})

Then('the context event name is {string}', function (eventName) {
  assert.equal(this.shimResult.context.eventName, eventName)
})

Then('the context actor is the runner actor', function () {
  assert.equal(this.shimResult.context.actor, 'tester')
})

Then('the context issue number is {int}', function (number) {
  assert.equal(this.shimResult.context.issue.number, number)
})

Then('the context payload mirrors the event file', function () {
  const payload = JSON.parse(this.shimFs.__files[EVENT_FILE])
  assert.deepEqual(this.shimResult.context.payload, payload)
})

Then('core setOutput appends to the GITHUB_OUTPUT file', function () {
  this.shimResult.core.setOutput('findings', 3)
  assert.equal(this.shimFs.__files[OUTPUT_FILE], 'findings=3\n')
})

Then('core setOutput emits a set-output workflow command', function () {
  this.shimResult.core.setOutput('findings', 3)
  assert.ok(this.shimLog.includes('::set-output name=findings::3'),
    `expected set-output command, log: ${this.shimLog.join(' | ')}`)
})

Then('core setSecret emits an add-mask workflow command', function () {
  this.shimResult.core.setSecret('super-secret')
  assert.ok(this.shimLog.includes('::add-mask::super-secret'),
    `expected add-mask command, log: ${this.shimLog.join(' | ')}`)
})

Then('the github client authenticates with the runner token', function () {
  assert.equal(this.octokitOpts.auth, 'ghs-test')
})

Then('the github client exposes the rest and paginate surface', function () {
  assert.ok(this.shimResult.github.rest, 'expected github.rest')
  assert.equal(typeof this.shimResult.github.paginate, 'function', 'expected github.paginate')
  assert.equal(typeof this.shimResult.github.graphql, 'function', 'expected github.graphql')
})

// Re-exported pins so the feature stays honest about what ships.
Then('the image manifest constants point at the system locations', function () {
  assert.equal(MANIFEST_PATH, '/opt/brave-security/manifest.json')
  assert.equal(SYSTEM_BIN_DIR, '/usr/local/bin')
  assert.equal(typeof installLandrun, 'function')
  assert.equal(typeof installOpengrep, 'function')
  assert.match(LANDRUN_VERSION, /^v\d+\.\d+\.\d+$/)
  assert.match(OPENGREP_VERSION, /^v\d+\.\d+\.\d+$/)
})
