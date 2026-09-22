#!/usr/bin/env bash
# Landlock sandbox wrapper.
#
# Runs a command inside a landrun sandbox (Linux Landlock LSM). Fails closed
# in CI when sandboxing is impossible; degrades to a warning plus direct
# execution locally (macOS dev, kernels without Landlock).
#
# Usage:
#   with-sandbox.sh [landrun-args...] -- command [args...]
#
# Environment:
#   LANDRUN_BIN       landrun binary (default: ~/.landrun/bin/landrun, then PATH)
#   SANDBOX_LSM_PATH  kernel LSM list (default: /sys/kernel/security/lsm)
#   CI                GitHub Actions sets CI=true; fail-closed trigger
#   SANDBOX_CLEAN_ENV when "1", the sandboxed command runs with a scrubbed
#                     environment: only SANDBOX_ENV_ALLOWLIST variables below
#                     survive, so install scripts cannot read action secrets
#
# The wrapper always injects --best-effort so the sandbox degrades to the
# best Landlock ABI the kernel supports instead of refusing older kernels.
# Denying a run entirely is the job of the fail-closed checks below.
set -u

warn () { echo "with-sandbox: $*" >&2; }
fail () { echo "with-sandbox: Landlock sandbox unavailable: $*" >&2; exit 1; }

LANDRUN_BIN="${LANDRUN_BIN:-$HOME/.landrun/bin/landrun}"
if [ ! -x "$LANDRUN_BIN" ]; then
  LANDRUN_BIN="$(command -v landrun 2>/dev/null || true)"
fi
SANDBOX_LSM_PATH="${SANDBOX_LSM_PATH:-/sys/kernel/security/lsm}"

# Split invocation: landrun policy args before "--", command after it.
LR_ARGS=()
while [ $# -gt 0 ] && [ "$1" != "--" ]; do
  LR_ARGS+=("$1")
  shift
done
if [ $# -eq 0 ]; then
  echo "usage: with-sandbox.sh [landrun-args...] -- command [args...]" >&2
  exit 2
fi
shift

# No landrun binary: fail closed in CI, degrade locally.
if [ -z "$LANDRUN_BIN" ] || [ ! -x "$LANDRUN_BIN" ]; then
  if [ "${CI:-}" = "true" ]; then
    fail "landrun binary not found (install it via src/installLandrun.js)."
  fi
  warn "landrun binary not found; running unsandboxed (local mode)."
  exec "$@"
fi

# Kernel without Landlock (or unknown LSM list): fail closed in CI, degrade
# locally. An unreadable LSM list counts as unsupported — do not guess.
if [ ! -r "$SANDBOX_LSM_PATH" ] || ! grep -qw landlock "$SANDBOX_LSM_PATH"; then
  if [ "${CI:-}" = "true" ]; then
    fail "kernel LSM list at $SANDBOX_LSM_PATH does not include landlock."
  fi
  warn "Landlock not enabled on this kernel; running unsandboxed (local mode)."
  exec "$@"
fi

# Environment scrubbing: landrun v0.1.17 passes NO environment variables to
# the sandboxed command unless --env is given. SANDBOX_CLEAN_ENV=1 forwards
# exactly the SANDBOX_ENV_ALLOWLIST variables via --env, so untrusted install
# scripts can never read exported secrets (REVIEWDOG_GITHUB_API_TOKEN,
# GITHUB_TOKEN, ...), even on landrun builds that inherit the environment.
SANDBOX_ENV_ALLOWLIST="PATH HOME LANG LC_ALL TMPDIR TMP TEMP SCRIPTPATH RUNNER_TEMP PIP_AUDIT_VENV_BASE PYPI_INDEX_URL PYPI_INSECURE_HOSTS GIT_OPTIONAL_LOCKS GITHUB_BASE_REF"
if [ "${SANDBOX_CLEAN_ENV:-}" = "1" ]; then
  for var in $SANDBOX_ENV_ALLOWLIST; do
    if [ -n "${!var:-}" ]; then
      LR_ARGS+=("--env" "$var")
    fi
  done
  if [ -z "${PATH:-}" ]; then
    LR_ARGS+=(--env "PATH=/usr/bin:/bin")
  fi
fi

# Resolve the command to an absolute path: landrun v0.1.17 misparses
# argv when --env flags are combined with a bare command name (LookPath
# receives an empty string). Resolving here avoids the bug and pins the
# binary before the sandbox applies.
if [ $# -gt 0 ]; then
  resolved="$(command -v -- "$1" 2>/dev/null || true)"
  if [ -n "$resolved" ]; then
    set -- "$resolved" "${@:2}"
  fi
fi

exec "$LANDRUN_BIN" --best-effort "${LR_ARGS[@]}" -- "$@"