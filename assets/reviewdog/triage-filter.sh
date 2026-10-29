#!/usr/bin/env bash
# Best-effort triage filter between the reviewdog local run and posting.
#
# Applies agentic FP-triage verdicts (via scripts/triage-filter.mjs) to the
# runner log in place: suppressed findings are dropped, others get a short
# triage note. Fail-open: any error leaves the log untouched so posting
# proceeds exactly as before.
#
# Usage: triage-filter.sh <runner> <runner.log>
set -uo pipefail

SCRIPTPATH="$(cd "$(dirname "$0")" && pwd)"
RUNNER="${1:?usage: triage-filter.sh <runner> <log>}"
LOG="${2:?usage: triage-filter.sh <runner> <log>}"

CAPTURE_DIR="${RUNNER_TEMP:-/tmp}/security-action"

mkdir -p "$CAPTURE_DIR" || true

node "$SCRIPTPATH/../../scripts/triage-filter.mjs" \
    --runner "$RUNNER" \
    --log "$LOG" \
    --config "$CAPTURE_DIR/triage-config.json" \
    --raw "$CAPTURE_DIR/${RUNNER}-slim.jsonl" \
    --out "$LOG" \
    >"$CAPTURE_DIR/${RUNNER}-triage-summary.json" \
    2>"$CAPTURE_DIR/${RUNNER}-triage.stderr.log" || true
