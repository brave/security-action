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
// this helper replicates that logic exactly.
export function nudgeSeverityForToday () {
  const today = new Date()
  return today.getDate() <= 7 ? 'medium' : 'high'
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
