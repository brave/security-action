#!/usr/bin/env bash
# Verify that every third-party GitHub Action reference in the tracked
# workflow and composite-action files is pinned to a full 40-character
# commit SHA that actually exists upstream. Exempts local `./` steps and
# first-party brave/security-action references (which track @main by
# design — see the README branching strategy).
#
# Used by scripts/pr-check.sh; fails on the first bad pin class it
# reports, after listing them all.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

# Deliberate split: the list is used unquoted word-by-word below.
# shellcheck disable=SC2207
yaml_files=($(git ls-files .github/workflows actions | grep -E '\.ya?ml$' || true))
[ ${#yaml_files[@]} -gt 0 ] || { echo "check-action-pins: no yaml files found"; exit 0; }

# uses: owner/repo[/path]@ref   (also handles list-item indentation)
# Deliberate word split of the file list (command-substitution arrays).
# shellcheck disable=SC2086
refs="$(grep -hoE 'uses:[[:space:]]*[^[:space:]]+@[^[:space:]]+' \
  ${yaml_files[@]+"${yaml_files[@]}"} \
  | sed -E 's/uses:[[:space:]]*//' | sort -u || true)"
[ -n "$refs" ] || { echo "check-action-pins: no action references found"; exit 0; }

bad=0
while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  repo="${ref%@*}"
  sha="${ref#*@}"

  # Local path references and first-party self-references are exempt.
  case "$repo" in
    ./* | . ) continue ;;
    brave/security-action*) continue ;;
  esac

  if ! [[ "$sha" =~ ^[0-9a-f]{40}$ ]]; then
    echo "NOT PINNED TO A FULL SHA: $ref"
    bad=$((bad + 1))
    continue
  fi

  owner="${repo%%/*}"
  path="${repo#*/}"
  upstream="${owner}/${path%%/*}"
  if ! gh api "repos/$upstream/commits/$sha" > /dev/null 2>&1; then
    echo "SHA DOES NOT EXIST UPSTREAM: $ref (looked up $upstream@$sha)"
    bad=$((bad + 1))
  fi
done <<< "$refs"

if [ "$bad" -gt 0 ]; then
  echo "check-action-pins: $bad bad pin(s)"
  exit 1
fi
echo "check-action-pins: all third-party actions pinned to real SHAs"
