#!/usr/bin/env bash
# Materialize buggy checkouts for the Vul4J repos used by the paper's
# 50-alert sample. Buggy state = parent of the human_patch fix commit.
# Some fix commits only exist in the tuhh-softsec/Vul4J fork (upstream
# repos moved/restructured), so candidates are tried in order until the
# checkout contains every sampled alert file.
# Usage: scripts/bench/prepare-vul4j.sh [out-dir]
set -euo pipefail

MANIFEST=${VUL4J_MANIFEST:-tmp/paper-artifact/data/artifact-data/shared/vul4j/triage-vul4j-alerts_meta/manifest.json}
CSV=${VUL4J_CSV:-tmp/paper-artifact/vul4j/dataset/vul4j_dataset.csv}
OUT=${1:-tmp/vul4j-repos}

[ -f "$MANIFEST" ] || { echo "manifest missing: $MANIFEST" >&2; exit 1; }
[ -f "$CSV" ] || { echo "csv missing: $CSV" >&2; exit 1; }
mkdir -p "$OUT"

# repo part of a github URL: host/owner/repo
url_repo() {
  echo "$1" | sed -E 's#https://github\.com/([^/]+/[^/]+)/.*#\1#'
}

ok=0; skip=0; fail=0
for vid in $(jq -r '[.sampled_alerts[].vul4j_id] | unique | .[]' "$MANIFEST"); do
  target="$OUT/$vid"
  info=$(python3 -c '
import csv, sys
vid, path = sys.argv[1], sys.argv[2]
with open(path, newline="") as f:
    for r in csv.DictReader(f):
        if r["vul_id"] == vid:
            print(r["repo_slug"] + "\t" + r["human_patch"])
            break
' "$vid" "$CSV")
  if [ -z "$info" ]; then
    echo "FAIL $vid: no csv row" >&2
    fail=$((fail + 1))
    continue
  fi
  slug=${info%%$'\t'*}
  url=${info#*$'\t'}
  sha=$(echo "$url" | { grep -oE '[0-9a-f]{7,40}' || true; } | tail -1)
  if [ -z "$sha" ]; then
    echo "FAIL $vid: no commit sha in $url" >&2
    fail=$((fail + 1))
    continue
  fi
  patch_repo=$(url_repo "$url")

  files=$(jq -r --arg v "$vid" \
    '[.sampled_alerts[] | select(.vul4j_id==$v) | .file] | unique | .[]' \
    "$MANIFEST")

  if [ -d "$target/.git" ] && git -C "$target" rev-parse --quiet --verify "${sha}^" >/dev/null 2>&1; then
    git -C "$target" checkout --quiet "${sha}^"
    skip=$((skip + 1))
    continue
  fi
  rm -rf "$target"

  attempts=("$patch_repo" "$slug" "tuhh-softsec/Vul4J")
  done_vid=0
  for cand in "${attempts[@]}"; do
    echo "try $vid <- github.com/$cand @ ${sha}^"
    if ! git clone --quiet --filter=blob:none --no-checkout \
        "https://github.com/$cand" "$target" 2>/dev/null; then
      rm -rf "$target"
      continue
    fi
    if git -C "$target" rev-parse --quiet --verify "${sha}^" >/dev/null 2>&1 \
        && git -C "$target" checkout --quiet "${sha}^"; then
      all_files_ok=1
      while IFS= read -r f; do
        [ -n "$f" ] || continue
        if [ ! -f "$target/$f" ]; then
          all_files_ok=0
          break
        fi
      done <<<"$files"
      if [ "$all_files_ok" -eq 1 ]; then
        done_vid=1
        break
      fi
    fi
    rm -rf "$target"
  done
  if [ "$done_vid" -eq 1 ]; then
    ok=$((ok + 1))
  else
    echo "FAIL $vid: no candidate contains ${sha}^ with alert files" >&2
    fail=$((fail + 1))
  fi
done

echo "cloned=$ok skipped=$skip failed=$fail"
[ "$fail" -eq 0 ]
