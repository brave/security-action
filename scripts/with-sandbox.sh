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

exec "$LANDRUN_BIN" --best-effort "${LR_ARGS[@]}" -- "$@"