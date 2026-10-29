const MAX_ANNOTATION_CHARS = 200
const TRIAGE_NOTE_PREFIX = '<br>🤖 triage'

/**
 * Rewrite reviewdog log lines in place according to triage verdicts.
 *
 * The reviewdog line format is `%t:%f:%l %m` (severity:path:line message).
 * Suppressed findings (policyDecision = suppress) are dropped entirely so
 * reviewdog never posts them; every other triaged finding carries a short
 * triage note appended to its comment. Untriaged and unparseable lines
 * pass through unchanged.
 */
export function applyTriageToLog (logLines, triageRows) {
  const byLocation = new Map()
  for (const r of triageRows ?? []) {
    if (!r || typeof r.file !== 'string' || !Number.isFinite(r.line)) continue
    byLocation.set(`${r.file}:${r.line}`, r)
  }
  const lines = []
  let suppressedCount = 0
  let annotatedCount = 0
  for (const raw of logLines ?? []) {
    const m = /^([A-Z]):(.+?):(\d+) (.*)$/.exec(raw)
    if (!m) {
      lines.push(raw)
      continue
    }
    const [, , file, lineStr] = m
    const row = byLocation.get(`${file}:${Number(lineStr)}`)
    if (!row) {
      lines.push(raw)
      continue
    }
    if (row.decision === 'suppress') {
      suppressedCount++
      continue
    }
    annotatedCount++
    lines.push(`${raw}${note(row)}`)
  }
  return { lines, suppressedCount, annotatedCount }
}

function note (row) {
  const v = row.verdict ?? {}
  const reason = String(v.reason ?? '').slice(0, MAX_ANNOTATION_CHARS)
  return `${TRIAGE_NOTE_PREFIX} (${row.agent ?? 'agent'}): ${v.label ?? 'UNKNOWN'}/${v.confidence ?? 'low'} — ${reason}`
}
