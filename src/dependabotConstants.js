// Shared constants and helpers for Dependabot-related
// modules (nudge, dismiss, reconciliation).

export const DEFAULT_SKIP_HOTWORDS = [
  'dos',
  'denial of service',
  'redos',
  'denial-of-service',
  'memory explosion',
  'inefficient regular expression',
  'regular expression complexity'
]

// Severity enum used by both nudge and dismiss.
export const Severity = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3
}

// Compute the minimum severity level that matches
// the nudge action's date-based logic:
//   - 'medium' if today is within the first 7 days
//     of the month (matching the nudge action)
//   - 'high' otherwise
//
// The nudge action (action.cjs) uses getDate() <= 7;
// this helper replicates that logic exactly. An optional `date`
// may be injected for testing.
export function nudgeSeverityForToday (date = new Date()) {
  return date.getDate() <= 7 ? 'medium' : 'high'
}

// Monday of the ISO week containing `date` (local time, matching
// the local getDate() used by nudgeSeverityForToday).
export function mondayOfIsoWeek (date = new Date()) {
  const monday = new Date(date)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return monday
}

// Severity threshold the nudge used for the ISO week containing
// `date`. The nudge runs on Mondays and applies the day-of-month
// rule to that Monday, so every other run in the same week
// (reconciliation, refresh) must derive its threshold from the
// Monday as well. Using today's date instead would let a run one
// day past a month boundary qualify more alerts than the week's
// nudge posted (2026-08-31 incident: nudge on Monday Aug 31 at
// 'high', reconcile on Sep 1 at 'medium' appended 5 medium alerts
// to a high-only thread mid-week).
export function nudgeSeverityForWeek (date = new Date()) {
  return nudgeSeverityForToday(mondayOfIsoWeek(date))
}

// Return the severity keys at or above `minlevel`.
// E.g. severityKeysAbove('high') => ['high','critical']
export function severityKeysAbove (minlevel) {
  const min = typeof minlevel === 'string'
    ? Severity[minlevel]
    : minlevel
  return Object.keys(Severity).filter(
    s => Severity[s] >= min
  )
}
