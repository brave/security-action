// Sentry Crons check-in for scheduled workflows (deadman switch).
//
// Reads the semi-secret ingest URL from the SENTRY_CRON_URL environment
// variable and silently no-ops when it is unset, so workflow wiring can
// ship before the org secret exists. Failures are swallowed without
// leaking the URL, so a missed check-in can never fail the job.

const asPositiveInt = (value) => (/^\d+$/.test(value) ? Number(value) : undefined)

function inProgressBody ({ schedule, timezone, checkinMargin, maxRuntime }) {
  const body = { status: 'in_progress' }
  if (schedule) {
    body.monitor_config = { schedule: { type: 'crontab', value: schedule } }
    if (timezone) body.monitor_config.timezone = timezone
    const margin = asPositiveInt(checkinMargin)
    if (margin !== undefined) body.monitor_config.checkin_margin = margin
    const runtime = asPositiveInt(maxRuntime)
    if (runtime !== undefined) body.monitor_config.max_runtime = runtime
  }
  return JSON.stringify(body)
}

export async function checkIn ({
  monitor,
  status,
  schedule = '',
  timezone = '',
  checkin_margin: checkinMargin = '',
  max_runtime: maxRuntime = ''
} = {}) {
  const url = process.env.SENTRY_CRON_URL || ''
  if (!url) {
    console.log(`sentry-cron: SENTRY_CRON_URL not set, skipping monitor '${monitor}'`)
    return
  }
  if (!status) {
    console.log(`sentry-cron: no status input, skipping monitor '${monitor}'`)
    return
  }
  const inProgress = status === 'in_progress'
  try {
    const res = await fetch(inProgress ? url : `${url}?status=${encodeURIComponent(status)}`, {
      method: inProgress ? 'POST' : 'GET',
      headers: inProgress ? { 'content-type': 'application/json' } : undefined,
      body: inProgress ? inProgressBody({ schedule, timezone, checkinMargin, maxRuntime }) : undefined,
      signal: AbortSignal.timeout(30_000)
    })
    // drain and discard: the ingest URL embeds a credential that must
    // never reach logs, and the response body is noise regardless
    await res.arrayBuffer()
  } catch {
    console.error('sentry-cron: check-in request failed')
  }
}
