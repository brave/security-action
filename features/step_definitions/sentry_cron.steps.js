import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import http from 'http'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import path from 'path'

const runFile = promisify(execFile)

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const SCRIPT = path.join(ROOT, 'actions', 'sentry-cron', 'checkin.sh')
const HOST = '127.0.0.1'

/** Capture server mirroring the verified Sentry ingest: POST body upserts,
 *  GET ?status=<s> closes, both answer 202 empty. Requests recorded. */
function makeCaptureServer () {
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      server.__requests.push({ method: req.method, url: req.url, body })
      res.writeHead(202)
      res.end()
    })
  })
  server.__requests = []
  return server
}

function listen (server) {
  return new Promise((resolve) => server.listen(0, HOST, () => resolve(server.address().port)))
}

After(function () {
  if (this.server) {
    this.server.closeAllConnections()
    this.server.close()
    this.server = undefined
  }
})

Given('no SENTRY_CRON_URL is configured', function () {
  this.url = ''
})

Given('a local capture server standing in for the Sentry ingest', async function () {
  this.server = makeCaptureServer()
  this.port = await listen(this.server)
})

Given('SENTRY_CRON_URL points at the capture server', function () {
  this.url = `http://${HOST}:${this.port}/api/4512324234051584/cron/workflows-selftest/dc6b9c9041a59f9458a4ad4c0b870802/`
})

Given('SENTRY_CRON_URL points at a closed port', function () {
  this.url = `http://${HOST}:1/api/4512324234051584/cron/workflows-selftest/dc6b9c9041a59f9458a4ad4c0b870802/`
})

When('checking in {string} for monitor {string} with schedule {string} and margin {string}', async function (status, monitor, schedule, margin) {
  const env = { ...process.env }
  delete env.SENTRY_CRON_URL
  env.INPUT_MONITOR = monitor
  env.INPUT_STATUS = status
  env.INPUT_SCHEDULE = schedule
  env.INPUT_TIMEZONE = 'UTC'
  env.INPUT_CHECKIN_MARGIN = margin
  if (this.url) env.SENTRY_CRON_URL = this.url
  // Async, not spawnSync: a blocking spawn would freeze this process'
  // event loop and starve the capture server it must also serve.
  try {
    const run = await runFile('bash', [SCRIPT], { env, timeout: 60000 })
    this.exitCode = 0
    this.output = `${run.stdout ?? ''}${run.stderr ?? ''}`
  } catch (err) {
    this.exitCode = err.code ?? 1
    this.output = `${err.stdout ?? ''}${err.stderr ?? ''}`
  }
})

Then('the script exits successfully', function () {
  assert.equal(this.exitCode, 0, `expected exit 0, got ${this.exitCode}; output: ${this.output}`)
})

Then('no HTTP request is made', function () {
  assert.ok(!this.server || this.server.__requests.length === 0)
})

Then('no HTTP request is received by the capture server', function () {
  assert.ok(!this.server || this.server.__requests.length === 0)
})

Then('the ingest receives a POST with body:', function (expectedBody) {
  const posts = this.server.__requests.filter(r => r.method === 'POST')
  assert.equal(posts.length, 1, `expected one POST, got: ${JSON.stringify(this.server.__requests)}`)
  const actual = posts[0].body.trim() ? JSON.parse(posts[0].body) : {}
  assert.deepEqual(actual, JSON.parse(expectedBody))
})

Then('the ingest receives a GET for status {string}', function (status) {
  const gets = this.server.__requests.filter(r => r.method === 'GET' && r.url.endsWith(`?status=${status}`))
  assert.equal(gets.length, 1, `expected GET ?status=${status}, got: ${JSON.stringify(this.server.__requests)}`)
})

Then('the script output does not contain the check-in URL', function () {
  assert.ok(!this.output.includes(this.url), `URL leaked into output: ${this.output}`)
})
