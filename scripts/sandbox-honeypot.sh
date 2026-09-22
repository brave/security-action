#!/usr/bin/env bash
# E2E honeypot checks for the Landlock sandbox. Run on a Landlock-capable
# Linux host (GitHub runners): every probe runs through with-sandbox.sh and
# asserts the deny-by-default posture — honeypot reads denied, network
# denied without egress grants, TLS 443 reachable when granted, and the
# wrapper fails closed when the sandbox is unavailable.
set -u
FAILS=0
fail() { echo "HONEYPOT-FAIL: $*"; FAILS=$((FAILS+1)); }
pass() { echo "HONEYPOT-PASS: $*"; }

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT" || exit 1
WRAPPER="scripts/with-sandbox.sh"

# ── Honeypots ────────────────────────────────────────────────────────────
# Never clobber a real .env: only seed one when the repo has none (CI).
if [ ! -f "$REPO_ROOT/.env" ]; then
  echo "SANDBOX-HONEYPOT-ENV=canary" > "$REPO_ROOT/.env"
fi
mkdir -p "$HOME/.ssh"
echo "SANDBOX-HONEYPOT-SSH-KEY" > "$HOME/.ssh/sandbox-canary"

# Common grant family used by the scanner runners (workspace read-only,
# private temp writable, toolchain executables, no egress).
mktemp_dir="$(mktemp -d)"
GRANTS=(--ignore-missing
  --ro "$REPO_ROOT"
  --rwx "$mktemp_dir" --rw /dev/null
  --rox /usr --rox /lib --rox /lib64
  --ro /etc --ro /run)

# ── 1. Fail-closed when the sandbox binary is missing in CI ──────────────
if CI=true LANDRUN_BIN=/nonexistent bash "$WRAPPER" -- echo ok >/dev/null 2>&1; then
  fail "wrapper did not fail closed with missing landrun in CI"
else
  pass "wrapper fails closed when landrun is missing (CI)"
fi

# ── 2. Honeypot reads denied (.env + $HOME/.ssh) ─────────────────────────
if bash "$WRAPPER" "${GRANTS[@]}" \
  -- bash -c 'cat "$PWD/.env" "$HOME/.ssh/sandbox-canary"' >/dev/null 2>&1; then
  fail "honeypot read (.env / ~/.ssh) was allowed"
else
  pass "honeypot reads (.env / ~/.ssh) denied"
fi

# ── 3. Zero network: localhost connect denied ────────────────────────────
python3 -m http.server 8080 --bind 127.0.0.1 >/dev/null 2>&1 &
LISTENER=$!
sleep 1
NET_OUT="$(bash "$WRAPPER" "${GRANTS[@]}" \
  -- python3 -c "
import socket
s = socket.socket()
s.settimeout(3)
try:
    s.connect(('127.0.0.1', 8080)); print('CONNECTED')
except OSError as e:
    print('DENIED', e.errno)" 2>/dev/null)"
kill "$LISTENER" 2>/dev/null
if echo "$NET_OUT" | grep -q CONNECTED; then
  fail "zero-network sandbox connected to localhost:8080"
else
  pass "zero-network connect to localhost:8080 denied ($NET_OUT)"
fi

# ── 4. TLS 443 reachable when egress is granted ──────────────────────────
TLS_OUT="$(bash "$WRAPPER" "${GRANTS[@]}" --connect-tcp 443 \
  -- python3 -c "
import socket
s = socket.socket()
s.settimeout(5)
s.connect(('api.github.com', 443)); print('TLS-CONNECTED')" 2>/dev/null)"
if echo "$TLS_OUT" | grep -q TLS-CONNECTED; then
  pass "TLS 443 egress granted and reachable"
else
  fail "TLS 443 egress probe failed ($TLS_OUT)"
fi

# ── 5. Granted writable temp is usable ───────────────────────────────────
if bash "$WRAPPER" "${GRANTS[@]}" \
  -- bash -c "echo sandbox-write > '$mktemp_dir/probe.txt'" >/dev/null 2>&1 &&
  [ -f "$mktemp_dir/probe.txt" ]; then
  pass "granted writable temp dir accepts writes"
else
  fail "granted writable temp dir unusable"
fi

# ── 6. Wrapper passes commands through ───────────────────────────────────
if bash "$WRAPPER" "${GRANTS[@]}" -- echo passthrough >/dev/null 2>&1; then
  pass "wrapper passes allowed commands through"
else
  fail "wrapper broke allowed command passthrough"
fi

rm -rf "$mktemp_dir"
echo "HONEYPOT_FAIL_COUNT=$FAILS"
exit "$FAILS"