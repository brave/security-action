/**
 * Retry-with-backoff wrapper for release-asset downloads.
 *
 * Single-shot downloads died on transient CDN/registry failures (503 during
 * the Oct 22 npmjs outage, 504 on a landrun release fetch, 504 on the
 * reviewdog setup download). This wraps the per-attempt fetch in an
 * exponential-backoff loop: 5 attempts, delay = min(2^i * 2s, 60s).
 *
 * Only transient failures are retried: HTTP 5xx, per-attempt timeouts and
 * network-level errors (DNS, connection reset, socket close). 4xx responses
 * are deterministic (403 permission, 404 missing asset — see Plans 1–2) and
 * fail fast; the shell-side curl paths additionally retry CDN 403/429 via
 * `--retry-all-errors`, which this helper deliberately does not mirror.
 */

import http from 'http'
import https from 'https'

export const RETRY_ATTEMPTS = 5
export const RETRY_BASE_DELAY_MS = 2000
export const RETRY_MAX_DELAY_MS = 60000
// Per-attempt stall guard: a hung connection is a transient failure, but it
// must not consume the whole retry budget on a single attempt.
export const ATTEMPT_TIMEOUT_MS = 60000
const MAX_REDIRECTS = 5

/**
 * Delay before retry number `attempt` (0-based): 2s, 4s, 8s, 16s … capped at
 * `maxDelayMs` so the total added retry budget stays bounded (~2 min).
 */
export function retryDelayMs (attempt, baseDelayMs = RETRY_BASE_DELAY_MS, maxDelayMs = RETRY_MAX_DELAY_MS) {
  return Math.min(baseDelayMs * (2 ** attempt), maxDelayMs)
}

/**
 * Decide whether an error from one fetch attempt is worth retrying.
 * Network-level errors (no statusCode: DNS failure, reset, timeout) are
 * transient; HTTP 5xx is transient; every 4xx is deterministic.
 */
export function isTransientError (err) {
  const status = err?.statusCode
  if (status === undefined) return true
  return status >= 500
}

/**
 * One download attempt: GET `url`, follow GitHub release redirects (301/302)
 * up to MAX_REDIRECTS, resolve the body as a Buffer. Rejects with an Error
 * carrying `statusCode` for non-200 responses (or no statusCode for
 * network-level failures). Chooses http/https by URL scheme so tests can
 * point it at a plain-http mock server.
 */
export function requestOnce (url, { timeoutMs = ATTEMPT_TIMEOUT_MS } = {}) {
  const follow = (target, redirectsLeft) => new Promise((resolve, reject) => {
    if (redirectsLeft <= 0) {
      reject(new Error(`Too many redirects while downloading: ${url}`))
      return
    }
    const mod = target.startsWith('https:') ? https : http
    const req = mod.get(target, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        response.resume()
        if (!response.headers.location) {
          reject(new Error(`Redirect without location header: HTTP ${response.statusCode}`))
          return
        }
        follow(response.headers.location, redirectsLeft - 1).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        const err = new Error(`Failed to download: HTTP ${response.statusCode}`)
        err.statusCode = response.statusCode
        response.resume()
        reject(err)
        return
      }
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    })
    req.on('error', reject)
    if (timeoutMs > 0) {
      req.setTimeout(timeoutMs, () => {
        const err = new Error(`Download attempt timed out after ${timeoutMs}ms`)
        req.destroy(err)
        reject(err)
      })
    }
  })
  return follow(url, MAX_REDIRECTS)
}

/**
 * Download `url` with exponential backoff across transient failures.
 *
 * Test seams (all optional):
 * - fetchOnce: replaces requestOnce (url, {timeoutMs} -> Buffer)
 * - sleep: replaces the delay between attempts (ms -> Promise)
 * - log: replaces console.log
 */
export async function fetchWithRetry (url, {
  attempts = RETRY_ATTEMPTS,
  baseDelayMs = RETRY_BASE_DELAY_MS,
  maxDelayMs = RETRY_MAX_DELAY_MS,
  timeoutMs = ATTEMPT_TIMEOUT_MS,
  fetchOnce = requestOnce,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  log = console.log
} = {}) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (attempt > 1) {
      const delay = retryDelayMs(attempt - 2, baseDelayMs, maxDelayMs)
      log(`Download attempt ${attempt - 1}/${attempts} failed transiently (${lastError.message}); retrying in ${delay}ms`)
      await sleep(delay)
    }
    try {
      return await fetchOnce(url, { timeoutMs })
    } catch (err) {
      lastError = err
      if (!isTransientError(err)) throw err
    }
  }
  throw lastError
}
