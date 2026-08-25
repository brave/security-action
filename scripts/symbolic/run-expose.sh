#!/usr/bin/env bash
# External symbolic-verification pass (ExpoSE) for pure src functions.
#
# Not a CI gate: run manually (or via the symbolic.yml workflow_dispatch
# workflow). Clones ExpoSE into tmp/ExpoSE, bundles each harness in
# scripts/symbolic/harnesses/*.src.js to CommonJS (ExpoSE/Jalangi2 cannot
# instrument ESM), then runs the analysis and reports explored paths.
#
# ExpoSE requires node 21.7.2 + clang + make. Missing prerequisites are
# reported and skipped — the property suite remains the soundness gate.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXPOSE_DIR="$ROOT/tmp/ExpoSE"
HARNESS_OUT="$ROOT/tmp/symbolic-harnesses"
NODE_VERSION="21.7.2"

mkdir -p "$HARNESS_OUT"

if ! ls "$ROOT"/scripts/symbolic/harnesses/*.src.js >/dev/null 2>&1; then
  echo "no harnesses in scripts/symbolic/harnesses/ — nothing to do"
  exit 0
fi

if [ ! -d "$EXPOSE_DIR" ]; then
  echo "cloning ExpoSE into $EXPOSE_DIR"
  git clone --depth 1 https://github.com/ExpoSEJS/ExpoSE.git "$EXPOSE_DIR"
fi

# ExpoSE is tested against node 21.7.2 only.
if command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env)"
  fnm install "$NODE_VERSION" 2>/dev/null || true
  fnm use "$NODE_VERSION" 2>/dev/null || echo "WARN: cannot pin node $NODE_VERSION, using $(node -v)"
else
  echo "WARN: fnm not found — ExpoSE requires node $NODE_VERSION, using $(node -v)"
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "ERROR: bun is required to bundle CJS harnesses" >&2
  exit 1
fi

FAILED=0
for harness in "$ROOT"/scripts/symbolic/harnesses/*.src.js; do
  name="$(basename "$harness" .src.js)"
  bun build "$harness" --format=cjs --outfile "$HARNESS_OUT/$name.cjs"
  echo "=== ExpoSE: $name ==="
  if (cd "$EXPOSE_DIR" && EXPOSE_MAX_TIME=60000 ./expoSE "$HARNESS_OUT/$name.cjs"); then
    echo "=== $name: OK ==="
  else
    echo "=== $name: ISSUES FOUND (see output above) ==="
    FAILED=1
  fi
done

exit "$FAILED"
