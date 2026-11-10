/**
 * Validate assignee logins before they reach the GitHub API.
 *
 * The `assignees` input has been observed polluted with an entire HTML
 * message (an LLM/hotword reply pasted into the workflow input — see
 * brave-experiments/brave-bot PRs #20, #58, #59, where the raw message was
 * split on whitespace into per-word "logins" and add-assignees 404'd).
 *
 * Such values are copied markup: everything after the first HTML tag is
 * message body, not a login list. Only the text before the first tag can
 * carry logins, and every token must match the GitHub login rules.
 * Non-matching tokens are dropped and reported through `onDropped`, the
 * list is deduplicated (case-insensitively — GitHub logins are) and capped
 * to bound API abuse.
 */
import { isForkPermissionError } from './githubWriteGuard.js'

export const LOGIN_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
export const MAX_ASSIGNEES = 10

// HTML tags mark copied markup: `<br>`, `</a>`, `<a href="...">`, `<!-- ... -->`
const TAG_RE = /<\/?[a-z!][^>]*>/i

function trimToken (token) {
  return token
    .replace(/^[@['"(]+/, '')
    .replace(/['".,;:!?)\]]+$/, '')
}

/**
 * Extract valid GitHub logins from a raw assignee value.
 *
 * @param {String} raw raw input (may contain HTML markup, commas, prose)
 * @param {Object} [opts]
 * @param {Number} [opts.max] maximum logins kept (default 10)
 * @param {Function} [opts.onDropped] called once with the dropped tokens
 * @returns {String[]} valid logins, deduped, capped
 */
export function sanitizeAssignees (raw, { max = MAX_ASSIGNEES, onDropped } = {}) {
  const text = typeof raw === 'string' ? raw : ''
  // Text before the first HTML tag is the only part that can carry logins;
  // the markup tail is copied message body and is never trusted.
  const segments = text.split(TAG_RE)
  const trusted = segments[0] ?? ''
  const markupTail = segments.slice(1).join(' ')

  const seen = new Set()
  const valid = []
  const dropped = []

  const consider = (token, trustedToken) => {
    const login = trimToken(token)
    if (login === '' || seen.has(login.toLowerCase())) { return }
    if (!trustedToken || !LOGIN_RE.test(login)) {
      dropped.push(login)
      return
    }
    seen.add(login.toLowerCase())
    if (valid.length >= max) {
      dropped.push(login)
      return
    }
    valid.push(login)
  }

  for (const token of trusted.split(/[\s,;]+/)) {
    consider(token, true)
  }
  // Tokens from the markup tail are never valid assignees — report them as
  // dropped so the warning shows what was ignored.
  for (const token of markupTail.split(/[\s,;]+/)) {
    consider(token, false)
  }

  if (dropped.length > 0 && onDropped) {
    onDropped(dropped)
  }
  return valid
}

/**
 * Look up a single login on the GitHub users API.
 *
 * @param {Object} github Octokit instance
 * @param {String} login candidate login
 * @returns {Object} { ok, reason } — reason explains drops in warnings
 */
async function lookupLogin (github, login) {
  try {
    const res = await github.request('GET /users/{login}', { login })
    if (res?.data?.type === 'User') {
      return { ok: true }
    }
    return { ok: false, reason: 'not a user account' }
  } catch (err) {
    if (err.status === 404) {
      return { ok: false, reason: 'login does not exist' }
    }
    return { ok: false, reason: `lookup failed (${err.status ?? 'no status'})` }
  }
}

/**
 * Pre-check candidate logins exist (as user accounts) before assigning.
 * Results are cached per run via the caller-provided map.
 *
 * @param {Object} github Octokit instance
 * @param {String[]} logins candidate logins
 * @param {Object} [opts]
 * @param {Map} [opts.cache] per-run cache keyed by lowercase login
 * @param {Function} [opts.onDropped] called once with "login (reason)" strings
 * @returns {String[]} logins that exist as user accounts
 */
export async function filterExistingLogins (github, logins, { cache = new Map(), onDropped } = {}) {
  const kept = []
  const dropped = []
  for (const login of logins) {
    const key = login.toLowerCase()
    let verdict = cache.get(key)
    if (verdict === undefined) {
      verdict = await lookupLogin(github, login)
      cache.set(key, verdict)
    }
    if (verdict.ok) {
      kept.push(login)
    } else {
      dropped.push(`${login} (${verdict.reason})`)
    }
  }
  if (dropped.length > 0 && onDropped) {
    onDropped(dropped)
  }
  return kept
}

/**
 * Add assignees to an issue without ever failing the job. Assignment is
 * auxiliary: 404 (unknown login / renamed repo mid-run) and 422 (login
 * without repo access) are surfaced as warnings only.
 *
 * Fork-context permission errors (403 "Resource not accessible by
 * integration", read-only GITHUB_TOKEN) are rethrown so the caller's
 * guardWrite can apply the shared fork-PR skip handling (message + job
 * summary mirror) instead of a generic assign failure.
 *
 * @param {Object} github Octokit instance
 * @param {Object} target { owner, repo, issue_number, assignees }
 * @param {Object} [opts]
 * @param {Function} [opts.warn] warning sink (e.g. core.warning)
 * @returns {Boolean} true when the assignees were added
 */
export async function addAssigneesSafely (github, { owner, repo, issue_number: issueNumber, assignees }, { warn = () => {} } = {}) {
  if (!assignees || assignees.length === 0) {
    return false
  }
  try {
    await github.rest.issues.addAssignees({ owner, repo, issue_number: issueNumber, assignees })
    return true
  } catch (err) {
    if (isForkPermissionError(err)) { throw err }
    warn(`assign: skipped (${err.status ?? 'no status'}) — continuing: ${err.message}`)
    return false
  }
}
