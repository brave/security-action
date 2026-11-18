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
# Usage: install-reviewdog.sh [version]   default: the pinned version below
# The version pin lives HERE (single source) — action.yml calls the script
# without arguments and .github/workflows/image.yml extracts both the
# version and the digest from this file, so they cannot drift apart.
# Environment:
#   RUNNER_TEMP  staging dir base (default /tmp)
#   GITHUB_PATH  when set, the bin dir is appended so later steps find it
set -euo pipefail

# BEGIN reviewdog pins (release version + sha256 of the release .tar.gz
# assets + sha256 of the extracted reviewdog binary)
REVIEWDOG_VERSION_PIN="v0.17.5"
VERSION="${1:-$REVIEWDOG_VERSION_PIN}"
ASSET_VERSION="${VERSION#v}"

# BEGIN reviewdog tarball pins (sha256 of the release .tar.gz assets)
case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)
    DIST=Linux_x86_64
    SHA256=8480e1776bd54dfca3167bff4b117ef439fe6fe5869cdabbe4985652dfbcf417
    BIN_SHA256=a286d19863df1386d3449884e6b70dca43260e36e9a8e847aec7da5cac87db1e ;;
  Linux-aarch64 | Linux-arm64)
    DIST=Linux_arm64
    SHA256=7e51a552484582a794d66a71292ec42f3beac795c4ef8765e1d9e73f073c4b44
    BIN_SHA256=c59f48a284ca2ae1aef44f9ebde234bc599fa611e1d21e27e922237f9253afdd ;;
  Darwin-arm64)
    DIST=Darwin_arm64
    SHA256=0d670a7777dc9d296f7f3045197a9e744d8b06094df08b35a73540ed56b00448
    BIN_SHA256=f83986e51963817b2804c5cf5fc50b6468d342061d993f26bf281f26fde348e6 ;;
  Darwin-x86_64)
    DIST=Darwin_x86_64
    SHA256=a8405e653df595b02048610460fb345bed73280ed07e1ca09d51c4903a1c0b11
    BIN_SHA256=558f4a26e73cbafea44d920ea1e764b4a081283a21263f1eda5423b77822fd68 ;;
  *)
    echo "install-reviewdog: no pinned tarball digest for $(uname -s)-$(uname -m); add it to scripts/install-reviewdog.sh" >&2
    exit 1 ;;
esac
# END reviewdog tarball pins

hash_file () {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d' ' -f1
  else
    shasum -a 256 "$1" | cut -d' ' -f1
  fi
}

URL="https://github.com/reviewdog/reviewdog/releases/download/${VERSION}/reviewdog_${ASSET_VERSION}_${DIST}.tar.gz"
BIN_DIR="${RUNNER_TEMP:-/tmp}/reviewdog/bin"
STAGE="$(mktemp -d "${RUNNER_TEMP:-/tmp}/reviewdog-install.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT

# Prebuilt image (and re-runs within the same job): a reviewdog of the
# pinned version already on PATH needs no download. The skip only trusts
# the binary when BOTH checks pass:
#   - exact version match (not a substring: 0.17.5 must not match 0.17.50)
#   - the on-PATH binary hashes to the pinned release binary digest —
#     a same-version binary that was rebuilt elsewhere is not trusted.
# Anything else falls through to the pinned, digest-verified download.
if command -v reviewdog >/dev/null 2>&1; then
  FOUND="$(reviewdog --version)"
  if [[ "$FOUND" =~ (^|[^0-9])${ASSET_VERSION}([^0-9]|$) ]]; then
    FOUND_BIN="$(command -v reviewdog)"
    FOUND_SHA="$(hash_file "$FOUND_BIN")"
    if [ "$FOUND_SHA" = "$BIN_SHA256" ]; then
      echo "install-reviewdog: found ${FOUND} on PATH (digest match); skipping download"
      exit 0
    fi
    echo "install-reviewdog: reviewdog on PATH matches ${VERSION} but its digest differs; installing the pinned binary"
  fi
fi

echo "install-reviewdog: downloading ${URL}"
# --retry-all-errors: also retry 403/429 from the release CDN and 5xx
# (curl >= 7.71; runners ship far newer).
curl -fsSL --retry 5 --retry-all-errors --retry-delay 2 --retry-max-time 120 \
  -o "$STAGE/reviewdog.tar.gz" "$URL"

# Verify the pinned digest before extracting (fail closed on mismatch).
if [ "$(hash_file "$STAGE/reviewdog.tar.gz")" != "$SHA256" ]; then
  echo "install-reviewdog: SHA256 verification failed for $STAGE/reviewdog.tar.gz (wanted $SHA256)" >&2
  exit 1
fi
echo "install-reviewdog: SHA256 verification passed"

mkdir -p "$BIN_DIR"
tar --no-same-owner -xzf "$STAGE/reviewdog.tar.gz" -C "$BIN_DIR"
BIN="$BIN_DIR/reviewdog"
chmod 0755 "$BIN"

# Smoke test: the installed binary must run and report the pinned version.
REPORTED="$("$BIN" --version)"
if [[ "$REPORTED" =~ (^|[^0-9])${ASSET_VERSION}([^0-9]|$) ]]; then
  echo "install-reviewdog: installed $REPORTED"
else
  echo "install-reviewdog: version check failed: wanted $ASSET_VERSION, got '$REPORTED'" >&2
  exit 1
fi

if [ -n "${GITHUB_PATH:-}" ]; then
  echo "$BIN_DIR" >>"$GITHUB_PATH"
else
  echo "install-reviewdog: GITHUB_PATH unset; binary at $BIN"
fi
