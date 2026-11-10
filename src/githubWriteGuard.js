import fs from 'fs'

/**
 * Guard for GitHub API writes under a read-only GITHUB_TOKEN.
 *
 * For fork PRs (e.g. from netzenbot/bravebot) `pull_request` events run with
 * a token that cannot write to the PR. Every comment / label / assignee write
 * then fails with `403 Resource not accessible by integration` and previously
 * failed an otherwise-successful scan run. guardWrite treats that error as
 * "skip, not fail"; everything else (404, 422, network, ...) still throws.
 *
 * Permission errors are never retried — the default octokit retry policy
 * already exempts 403; keep it that way.
 */
const FORK_403 = /resource not accessible by integration/i

/**
 * Detect the fork-context permission failure.
 *
 * Matches both REST HttpError (err.status 403, message contains the
 * integration text) and GraphQL GraphqlResponseError (the same text inside
 * err.errors[].message; the HTTP status is 200 there).
 */
export function isForkPermissionError (err) {
  if (!err || typeof err !== 'object') return false
  const messages = [err.message]
  if (Array.isArray(err.errors)) {
    messages.push(...err.errors.map(e => e && e.message))
  }
  if (!messages.some(m => FORK_403.test(String(m ?? '')))) return false
  return err.status === 403 || err.name === 'GraphqlResponseError' || Array.isArray(err.errors)
}

/**
 * Run `fn()` (an octokit write call), swallowing fork-context 403s:
 * logs a warning via core (console.warn fallback when no core is passed),
 * runs the optional onSkip fallback (e.g. job-summary mirror) and resolves
 * to undefined. Any other error propagates.
 */
export function guardWrite (core, name, fn, onSkip) {
  const warn = (core && typeof core.warning === 'function')
    ? (msg) => core.warning(msg)
    : (msg) => console.warn(msg)
  return fn().catch((err) => {
    if (isForkPermissionError(err)) {
      warn(`${name}: skipped — GITHUB_TOKEN is read-only for this PR (fork context).`)
      if (onSkip) onSkip()
      return undefined
    }
    throw err
  })
}

/**
 * Append markdown text to the $GITHUB_STEP_SUMMARY file, when the runner
 * provides one. Fallback channel so fork-PR results stay visible without
 * write access. Returns true when written, false when no summary file exists.
 */
export function appendJobSummary (text, { env = process.env, fsMod = fs } = {}) {
  const file = env.GITHUB_STEP_SUMMARY
  if (!file) return false
  fsMod.appendFileSync(file, text)
  return true
}
