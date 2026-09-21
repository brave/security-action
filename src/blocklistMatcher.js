/**
 * Manifest-path blocklist matching for Dependabot alerts.
 *
 * Same file format and matching semantics as assets/cleaner.rb: one
 * pattern per line, '#' starts a comment, empty lines ignored, and a
 * line consisting only of '*'/'@' would match everything so it is
 * dropped with a warning. Patterns are matched like Ruby's
 * File.fnmatch("*#{pattern}*") — substring match where '*' spans any
 * characters (including '/'), '?' spans one character, '[...]'
 * keeps its character-class meaning and a backslash escapes the next
 * glob metacharacter.
 *
 * Matching uses a dynamic-programming walk instead of a RegExp so no
 * pattern compiled from file contents can trigger catastrophic
 * backtracking (ReDoS) on long manifest paths.
 */

function parseClass (body) {
  // Turn a bracket-expression body (already stripped of its
  // surrounding brackets) into inclusive { lo, hi } ranges.
  const items = []
  let i = 0
  let negated = false
  if (body[0] === '!' || body[0] === '^') {
    negated = true
    body = body.slice(1)
  }
  while (i < body.length) {
    let lo = body[i]
    if (lo === '\\' && i + 1 < body.length) {
      i++
      lo = body[i]
    }
    if (body[i + 1] === '-' && i + 2 < body.length) {
      let hi = body[i + 2]
      let hiEnd = i + 2
      if (hi === '\\' && i + 3 < body.length) {
        i++
        hi = body[i + 2]
        hiEnd = i + 2
      }
      items.push({ lo, hi })
      i = hiEnd + 1
    } else {
      items.push({ lo, hi: lo })
      i++
    }
  }
  return { items, negated }
}

/** Tokenize a glob into star/question/literal/class tokens. */
export function tokenize (pattern) {
  const tokens = []
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]
    if (c === '*') {
      tokens.push({ type: 'star' })
    } else if (c === '?') {
      tokens.push({ type: 'question' })
    } else if (c === '[') {
      const end = pattern.indexOf(']', i + 1)
      if (end === -1) {
        tokens.push({ type: 'literal', ch: '[' })
      } else {
        tokens.push({ type: 'class', ...parseClass(pattern.slice(i + 1, end)) })
        i = end
      }
    } else if (c === '\\' && i + 1 < pattern.length) {
      tokens.push({ type: 'literal', ch: pattern[++i] })
    } else {
      tokens.push({ type: 'literal', ch: c })
    }
  }
  return tokens
}

function classMatches (tok, ch) {
  const inside = tok.items.some(it => ch >= it.lo && ch <= it.hi)
  return inside !== tok.negated
}

/** Whether a single pattern matches, as cleaner.rb's "*pattern*" fnmatch. */
export function fnmatchSubstring (pattern, line) {
  if (line == null) return false
  const tokens = [{ type: 'star' }, ...tokenize(String(pattern)), { type: 'star' }]
  const n = line.length
  // dp[j]: tokens so far can consume line[0..j)
  let dp = new Array(n + 1).fill(false)
  dp[0] = true
  for (const tok of tokens) {
    const next = new Array(n + 1).fill(false)
    if (tok.type === 'star') {
      let seen = false
      for (let j = 0; j <= n; j++) {
        if (dp[j]) seen = true
        next[j] = seen
      }
    } else if (tok.type === 'question') {
      for (let j = 0; j < n; j++) next[j + 1] = dp[j]
    } else if (tok.type === 'class') {
      for (let j = 0; j < n; j++) {
        if (dp[j] && classMatches(tok, line[j])) next[j + 1] = true
      }
    } else {
      for (let j = 0; j < n; j++) {
        if (dp[j] && line[j] === tok.ch) next[j + 1] = true
      }
    }
    dp = next
    if (!dp.some(Boolean)) return false
  }
  return dp[n]
}

/**
 * Parse a blocklist file's contents into patterns. Returns
 * { patterns, warnings } where warnings lists dropped everything-
 * matches lines, so callers decide how to surface them.
 */
export function parseBlocklist (text) {
  const patterns = []
  const warnings = []
  for (const raw of String(text ?? '').split('\n')) {
    const line = raw.trim()
    if (line === '' || line.startsWith('#')) continue
    if (/^[*@]+$/.test(line)) {
      warnings.push(line)
      continue
    }
    patterns.push(line)
  }
  return { patterns, warnings }
}

/** Whether any pattern matches the manifest path. Returns the first matching pattern or null. */
export function matchBlocklist (patterns, manifestPath) {
  for (const pattern of patterns) {
    if (fnmatchSubstring(pattern, manifestPath)) return pattern
  }
  return null
}
