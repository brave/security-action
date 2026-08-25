#!/usr/bin/env bash
# External symbolic-verification pass (CrossHair) for pure Python functions
# in the assets/ scanners.
#
# Not a CI gate: run manually. Contracts live in
# scripts/symbolic/crosshair_contracts.py.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CONTRACTS="$ROOT/scripts/symbolic/crosshair_contracts.py"

if [ ! -f "$CONTRACTS" ]; then
  echo "no contracts file at $CONTRACTS — nothing to do"
  exit 0
fi

uv run --with crosshair python -m crosshair check "$CONTRACTS"
