import { Given, When, Then, After } from '@cucumber/cucumber'
import assert from 'assert'
import http from 'http'
import { checkIn } from '../../src/sentryCheckin.js'

const HOST = '127.0.0.1'

/** Capture server mirroring the verified Sentry ingest: POST body upserts,
 *  GET ?status=<s> closes, both answer 202 empty. Requests recorded.
 *  connection: close so the test process' undici pool never keeps
 *  sockets open past the scenario. */
function makeCaptureServer () {
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      server.__requests.push({ method: req.method, url: req.url, body })
      res.writeHead(202, { connection: 'close' })
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
  if (this.savedCronUrl !== undefined) {
    if (this.savedCronUrl === null) delete process.env.SENTRY_CRON_URL
    else process.env.SENTRY_CRON_URL = this.savedCronUrl
    this.savedCronUrl = undefined
  }
  if (this.server) {
    this.server.closeAllConnections()
    this.server.close()
    this.server = undefined
  }
})

Given('no SENTRY_CRON_URL is configured', function () {
  this.savedCronUrl = process.env.SENTRY_CRON_URL ?? null
  delete process.env.SENTRY_CRON_URL
})

Given('a local capture server standing in for the Sentry ingest', async function () {
  this.server = makeCaptureServer()
  this.port = await listen(this.server)
})

Given('SENTRY_CRON_URL points at the capture server', function () {
  this.savedCronUrl = process.env.SENTRY_CRON_URL ?? null
  process.env.SENTRY_CRON_URL = `http://${HOST}:${this.port}/api/4512324234051584/cron/workflows-selftest/dc6b9c9041a59f9458a4ad4c0b870802/`
})

Given('SENTRY_CRON_URL points at a closed port', function () {
  this.savedCronUrl = process.env.SENTRY_CRON_URL ?? null
  process.env.SENTRY_CRON_URL = `http://${HOST}:1/api/4512324234051584/cron/workflows-selftest/dc6b9c9041a59f9458a4ad4c0b870802/`
})

When('checking in {string} for monitor {string} with schedule {string} and margin {string}', async function (status, monitor, schedule, margin) {
  this.logs = []
  const origLog = console.log
  const origErr = console.error
  console.log = (...parts) => this.logs.push(parts.join(' '))
  console.error = (...parts) => this.logs.push(parts.join(' '))
  try {
    await checkIn({ monitor, status, schedule, timezone: 'UTC', checkin_margin: margin })
    this.threw = null
  } catch (err) {
    this.threw = err
  } finally {
    console.log = origLog
    console.error = origErr
  }
})

Then('the check-in completes without error', function () {
  assert.ok(!this.threw, `expected the check-in to complete, got: ${this.threw?.message}`)
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

Then('the check-in output does not contain the check-in URL', function () {
  const output = this.logs.join('\n')
  assert.ok(!output.includes(process.env.SENTRY_CRON_URL || ''), `URL leaked into output: ${output}`)
})
