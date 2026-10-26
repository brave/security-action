#!/usr/bin/env bash
# Sentry Crons check-in for scheduled workflows (deadman switch).
#
# Inputs arrive as INPUT_* environment variables (composite action
# convention); the semi-secret ingest URL comes from SENTRY_CRON_URL.
# An absent URL or status is a silent no-op, so workflow wiring can
# ship before the org secret exists. All curl output is discarded:
# the URL embeds an ingest credential that must never reach logs, and
# a failed check-in must never fail the workflow.
set -u

STATUS="${INPUT_STATUS:-}"
URL="${SENTRY_CRON_URL:-}"
MONITOR="${INPUT_MONITOR:-}"

if [ -z "$URL" ]; then
  echo "sentry-cron: SENTRY_CRON_URL not set, skipping monitor '${MONITOR}'"
  exit 0
fi
if [ -z "$STATUS" ]; then
  echo "sentry-cron: no status input, skipping monitor '${MONITOR}'"
  exit 0
fi

is_number() {
  case "$1" in
    '' | *[!0-9]*) return 1 ;;
  esac
}

# curl flags shared by every request: bounded so a hung ingest can
# never stall the workflow. Call sites discard stdout+stderr (the
# credential must never reach logs) and tolerate failure (a missed
# check-in must never fail the job).
CURL_ARGS=(-sS --connect-timeout 10 --max-time 30 -o /dev/null)

if [ "$STATUS" = "in_progress" ]; then
  SCHEDULE="${INPUT_SCHEDULE:-}"
  if [ -n "$SCHEDULE" ]; then
    MARGIN="${INPUT_CHECKIN_MARGIN:-}"
    RUNTIME="${INPUT_MAX_RUNTIME:-}"
    TIMEZONE="${INPUT_TIMEZONE:-}"
    PAYLOAD=$(jq -n \
      --arg status "$STATUS" \
      --arg schedule "$SCHEDULE" \
      --arg timezone "$TIMEZONE" \
      --argjson margin "$([ -n "$MARGIN" ] && is_number "$MARGIN" && echo "$MARGIN" || echo null)" \
      --argjson runtime "$([ -n "$RUNTIME" ] && is_number "$RUNTIME" && echo "$RUNTIME" || echo null)" \
      '{status: $status,
        monitor_config: ({schedule: {type: "crontab", value: $schedule},
                          timezone: (if $timezone == "" then null else $timezone end),
                          checkin_margin: $margin,
                          max_runtime: $runtime}
                         | with_entries(select(.value != null)))}')
  else
    PAYLOAD=$(jq -n --arg status "$STATUS" '{status: $status}')
  fi
  curl "${CURL_ARGS[@]}" -X POST -H 'Content-Type: application/json' --data "$PAYLOAD" "$URL" >/dev/null 2>&1 || true
else
  curl "${CURL_ARGS[@]}" "$URL?status=$STATUS" >/dev/null 2>&1 || true
fi