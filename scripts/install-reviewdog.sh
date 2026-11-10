#!/usr/bin/env bash
# Install reviewdog from a pinned release tarball with transient-fault retries.
#
# Replaces reviewdog/action-setup@v1.5.0: its generated installer performs a
# single unretried `curl -fsSL` and died on a 504 from the release CDN
# (PR #523). This script retries the download (curl --retry with
# --retry-all-errors covers 5xx/timeouts and CDN 403/429) and verifies the
# tarball against a pinned SHA256 digest before anything is extracted —
# fail closed when no digest is pinned for this platform.
#
# Usage: install-reviewdog.sh <version>   e.g. install-reviewdog.sh v0.17.5
# Environment:
#   RUNNER_TEMP  staging dir base (default /tmp)
#   GITHUB_PATH  when set, the bin dir is appended so later steps find it
set -euo pipefail

VERSION="${1:?usage: install-reviewdog.sh <version>}"
ASSET_VERSION="${VERSION#v}"

# BEGIN reviewdog tarball pins (sha256 of the release .tar.gz assets)
case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)
    DIST=Linux_x86_64
    SHA256=8480e1776bd54dfca3167bff4b117ef439fe6fe5869cdabbe4985652dfbcf417 ;;
  Linux-aarch64 | Linux-arm64)
    DIST=Linux_arm64
    SHA256=7e51a552484582a794d66a71292ec42f3beac795c4ef8765e1d9e73f073c4b44 ;;
  Darwin-arm64)
    DIST=Darwin_arm64
    SHA256=0d670a7777dc9d296f7f3045197a9e744d8b06094df08b35a73540ed56b00448 ;;
  Darwin-x86_64)
    DIST=Darwin_x86_64
    SHA256=a8405e653df595b02048610460fb345bed73280ed07e1ca09d51c4903a1c0b11 ;;
  *)
    echo "install-reviewdog: no pinned tarball digest for $(uname -s)-$(uname -m); add it to scripts/install-reviewdog.sh" >&2
    exit 1 ;;
esac
# END reviewdog tarball pins

URL="https://github.com/reviewdog/reviewdog/releases/download/${VERSION}/reviewdog_${ASSET_VERSION}_${DIST}.tar.gz"
BIN_DIR="${RUNNER_TEMP:-/tmp}/reviewdog/bin"
STAGE="$(mktemp -d "${RUNNER_TEMP:-/tmp}/reviewdog-install.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT

echo "install-reviewdog: downloading ${URL}"
# --retry-all-errors: also retry 403/429 from the release CDN and 5xx
# (curl >= 7.71; runners ship far newer).
curl -fsSL --retry 5 --retry-all-errors --retry-delay 2 --retry-max-time 120 \
  -o "$STAGE/reviewdog.tar.gz" "$URL"

# Verify the pinned digest before extracting (fail closed on mismatch).
if command -v sha256sum >/dev/null 2>&1; then
  echo "${SHA256}  $STAGE/reviewdog.tar.gz" | sha256sum -c - >/dev/null
else
  echo "${SHA256}  $STAGE/reviewdog.tar.gz" | shasum -a 256 -c - >/dev/null
fi
echo "install-reviewdog: SHA256 verification passed"

mkdir -p "$BIN_DIR"
tar --no-same-owner -xzf "$STAGE/reviewdog.tar.gz" -C "$BIN_DIR"
BIN="$BIN_DIR/reviewdog"
chmod 0755 "$BIN"

# Smoke test: the installed binary must run and report the pinned version.
REPORTED="$("$BIN" --version)"
case "$REPORTED" in
  *"$ASSET_VERSION"*) echo "install-reviewdog: installed $REPORTED" ;;
  *)
    echo "install-reviewdog: version check failed: wanted $ASSET_VERSION, got '$REPORTED'" >&2
    exit 1 ;;
esac

if [ -n "${GITHUB_PATH:-}" ]; then
  echo "$BIN_DIR" >>"$GITHUB_PATH"
else
  echo "install-reviewdog: GITHUB_PATH unset; binary at $BIN"
fi
