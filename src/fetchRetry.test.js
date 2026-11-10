import test from 'node:test'
import assert from 'node:assert'
import http from 'http'
import {
  fetchWithRetry,
  requestOnce,
  retryDelayMs,
  isTransientError,
  RETRY_ATTEMPTS
} from './fetchRetry.js'

/**
 * Fault-injection mock server: serves a scripted list of responses
 * ({status, body?, stallMs?}) in order, then repeats the last one, and
 * records the number of requests it served.
 */
function startMockServer (script) {
  return new Promise((resolve) => {
    let served = 0
    const server = http.createServer((req, res) => {
      const rawStep = script[Math.min(served, script.length - 1)]
      const step = typeof rawStep === 'function' ? rawStep() : rawStep
      served++
      if (step.stallMs) {
        // Never answer within the attempt timeout: exercises the stall path.
        req.on('close', () => res.destroy())
        return
      }
      res.writeHead(step.status || 200, step.headers || {})
      res.end(step.body || '')
    })
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, url: `http://127.0.0.1:${server.address().port}/asset`, served: () => served })
    })
  })
}

const noSleep = () => Promise.resolve()

test('fault injection: 503, 503, 200 succeeds on the third attempt', async () => {
  const { server, url, served } = await startMockServer([
    { status: 503, body: 'boom' },
    { status: 503, body: 'boom' },
    { status: 200, body: 'binary' }
  ])
  try {
    const content = await fetchWithRetry(url, { sleep: noSleep })
    assert.equal(content.toString(), 'binary')
    assert.equal(served(), 3)
  } finally {
    server.close()
  }
})

test('deterministic 404 fails fast (single request, no retry)', async () => {
  const { server, url, served } = await startMockServer([{ status: 404, body: 'nope' }])
  try {
    await assert.rejects(
      () => fetchWithRetry(url, { sleep: noSleep }),
      /Failed to download: HTTP 404/
    )
    assert.equal(served(), 1)
  } finally {
    server.close()
  }
})

test('always-5xx exhausts the attempt budget and rethrows the last error', async () => {
  const { server, url, served } = await startMockServer([{ status: 503, body: 'down' }])
  try {
    await assert.rejects(
      () => fetchWithRetry(url, { sleep: noSleep }),
      /Failed to download: HTTP 503/
    )
    assert.equal(served(), RETRY_ATTEMPTS)
  } finally {
    server.close()
  }
})

test('network-level errors (connection refused) are retried, then rethrown', async () => {
  // Port 1 on loopback: nothing listens there, every attempt fails at the
  // network level (no statusCode) — transient by policy.
  await assert.rejects(
    () => fetchWithRetry('http://127.0.0.1:1/asset', { attempts: 2, sleep: noSleep }),
    (err) => err.statusCode === undefined
  )
})

test('delays follow min(2^i * 2s, 60s): 2s, 4s, 8s, 16s between five attempts', async () => {
  const delays = []
  const sleep = (ms) => { delays.push(ms); return Promise.resolve() }
  await assert.rejects(() => fetchWithRetry('http://127.0.0.1:1/asset', { attempts: 5, sleep }))
  assert.deepEqual(delays, [2000, 4000, 8000, 16000])
})

test('long-running retries cap the delay at 60s', async () => {
  assert.equal(retryDelayMs(0), 2000)
  assert.equal(retryDelayMs(6), 60000)
  assert.equal(retryDelayMs(10), 60000)
})

test('stalled attempts are timed out and retried', async () => {
  const { server, url, served } = await startMockServer([
    { stallMs: 500 },
    { status: 200, body: 'binary' }
  ])
  try {
    const content = await fetchWithRetry(url, { timeoutMs: 50, sleep: noSleep })
    assert.equal(content.toString(), 'binary')
    assert.equal(served(), 2)
  } finally {
    server.close()
  }
})

test('requestOnce follows release-asset redirects and returns the body', async () => {
  const ctx = {}
  const { server, url } = await startMockServer([
    () => ({ status: 302, headers: { location: `${ctx.origin}/cdn` } }),
    { status: 200, body: 'from-cdn' }
  ])
  ctx.origin = url
  // The mock serves both hops from one origin; redirect handling is the
  // behavior under test, not the host change.
  try {
    const content = await requestOnce(url)
    assert.equal(content.toString(), 'from-cdn')
  } finally {
    server.close()
  }
})

test('isTransientError: 5xx transient, 4xx not, missing status transient', () => {
  const err = (statusCode) => Object.assign(new Error('x'), { statusCode })
  assert.equal(isTransientError(err(503)), true)
  assert.equal(isTransientError(err(504)), true)
  assert.equal(isTransientError(err(403)), false)
  assert.equal(isTransientError(err(404)), false)
  assert.equal(isTransientError(new Error('ECONNRESET')), true)
})
