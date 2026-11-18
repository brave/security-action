#!/usr/bin/env bash
# Pre-push / pre-PR validation gate.
#
# Runs the same checks CI runs — locally, before the push — plus the
# checks CI cannot do for a not-yet-pushed PR: every third-party GitHub
# Action must be pinned to a real, existing commit SHA (the guessed-SHA
# class of bug is invisible locally and red in CI, after the push).
#
# Usage: scripts/pr-check.sh [--quick]
#   --quick   deps + lint + lint-rules + shellcheck + yaml + pins only
#             (skips the slow unit/BDD/coverage/audit phases)
#
# Exit code: 0 when everything passes, 1 when any phase failed. All
# phases always run (no early exit) so one pass reports every problem.
set -uo pipefail

QUICK=false
[ "${1:-}" = "--quick" ] && QUICK=true

FAILED=()

phase () {
  local name="$1" cmd="$2"
  local log="/tmp/pr-check.${name//[^a-z0-9]/-}.log"
  echo "── ${name}"
  if eval "$cmd" > "$log" 2>&1; then
    echo "   PASS"
  else
    echo "   FAIL (log: $log)"
    tail -n 20 "/tmp/pr-check.${name//[^a-z0-9]/-}.log" | sed 's/^/   │ /'
    FAILED+=("$name")
  fi
}

cd "$(dirname "$0")/.." || exit 1

# Lint only the tracked tree: untracked scratch dirs (test fixtures,
# vendored rules) can contain symlink loops that crash the linter and
# are not part of any PR anyway — CI lints the checkout. Word-split
# assignment (works on the macOS bash 3.2 and the runners' bash 5).
# Deliberate split: the list is used unquoted word-by-word below.
# shellcheck disable=SC2207
TRACKED_JS=($(git ls-files '*.js' '*.cjs' '*.mjs'))
lint_tracked () {
  echo "── lint"
  # Deliberate word split of the file list (command-substitution arrays).
# shellcheck disable=SC2086
  if pnpm exec standard --ignore assets/opengrep_rules \
    ${TRACKED_JS[@]+"${TRACKED_JS[@]}"} \
    > /tmp/pr-check.lint.log 2>&1; then
    echo "   PASS"
  else
    echo "   FAIL (log: /tmp/pr-check.lint.log)"
    tail -n 20 /tmp/pr-check.lint.log | sed 's/^/   │ /'
    FAILED+=("lint")
  fi
}

phase deps 'pnpm install --frozen-lockfile'
lint_tracked
phase lint-rules 'pnpm run lint-rules'
phase shellcheck 'pnpm run shellcheck'

# Composite actions and workflows must stay valid YAML.
phase yaml 'node -e "
  const fs = require(\"fs\")
  const yaml = require(\"js-yaml\")
  const files = [
    ...require(\"child_process\").execSync(\"git ls-files .github/workflows actions\", {encoding: \"utf8\"})
      .split(\"\\n\").filter(f => f.endsWith(\".yml\") || f.endsWith(\".yaml\")),
  ]
  let bad = 0
  for (const f of files) {
    try { yaml.load(fs.readFileSync(f, \"utf8\")) }
    catch (e) { console.error(f + \": \" + e.message.split(\"\\n\")[0]); bad++ }
  }
  process.exit(bad ? 1 : 0)
"'

# Every third-party action must be pinned to a full, real commit SHA.
# First-party references (this repo, ./) and docker:// style refs are
# exempt; a guessed SHA — or a floating tag on a third-party action —
# fails here instead of in CI.
phase pins 'bash scripts/check-action-pins.sh'

if [ "$QUICK" = true ]; then
  echo
  if [ ${#FAILED[@]} -eq 0 ]; then
    echo "pr-check (quick): all phases passed"
    exit 0
  fi
  echo "pr-check (quick): FAILED phases: ${FAILED[*]}"
  exit 1
fi

phase unit 'pnpm run test:unit'
phase bdd 'pnpm run test:bdd'
phase coverage 'pnpm run coverage'
phase audit 'pnpm audit'

echo
if [ ${#FAILED[@]} -eq 0 ]; then
  echo "pr-check: all phases passed"
  exit 0
fi
echo "pr-check: FAILED phases: ${FAILED[*]}"
exit 1
