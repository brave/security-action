#!/bin/bash
# Posts one runner's findings as a GitHub pull-request review.
# Usage: post-findings.sh <runner>   (cwd holds <runner>.log)
#
# GitHub rejects the whole review POST when any finding anchors to a diff
# it cannot render ("Diff entry <path> diff is too large" for files with
# huge minified lines, e.g. scraped HTML fixtures). Strip those findings and
# retry once so the remaining findings still post; only an unrecoverable
# failure lands in reviewdog.fail.log.

set -e
runner=$1

if reviewdog -reporter=github-pr-review -efm='%f:%l: %m' <"$runner.log" 2>"reviewdog.$runner.posting.stderr.log"; then
    exit 0
fi

unpostable=$(grep -hoE 'Diff entry [^,]+ diff is too large' "reviewdog.$runner.posting.stderr.log" |
    sed -E 's/^Diff entry (.*) diff is too large$/\1/' |
    sort -u)

if [ -z "$unpostable" ]; then
    cat "$runner.log" >>reviewdog.fail.log
    exit 0
fi

retry_log="reviewdog.$runner.retry.log"
cp "$runner.log" "$retry_log"
while IFS= read -r unpostable_path; do
    [ -n "$unpostable_path" ] || continue
    # Prefix match (path:line:) instead of a regex so paths with dots or
    # other glob/regex metacharacters are dropped verbatim.
    awk -v prefix="$unpostable_path:" 'index($0, prefix) != 1' "$retry_log" >"$retry_log.tmp"
    mv "$retry_log.tmp" "$retry_log"
done <<<"$unpostable"

if ! reviewdog -reporter=github-pr-review -efm='%f:%l: %m' <"$retry_log" 2>>"reviewdog.$runner.posting.stderr.log"; then
    cat "$retry_log" >>reviewdog.fail.log
fi
rm -f "$retry_log" "$retry_log.tmp"
exit 0
