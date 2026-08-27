#!/usr/bin/env bash
# External symbolic-verification pass (ExpoSE) for pure src functions.
#
# Not a CI gate: run manually (or via the symbolic.yml workflow_dispatch
# workflow). Clones ExpoSE into tmp/ExpoSE, bundles each harness in
# scripts/symbolic/harnesses/*.src.js to CommonJS (ExpoSE/Jalangi2 cannot
# instrument ESM), then runs the analysis and reports explored paths.
#
# ExpoSE pins node 21.7.2 (engines in its package.json). The pinned
# binary is downloaded from nodejs.org into tmp/node-dist — no version
# manager required. cmake + make are needed to build the z3 fork once.
# The property suite remains the soundness gate.
#
# TOOLCHAIN LIMITATION: the vendored z3 fork (ExpoSEJS/z3 @8f3b923,
# 2019-era C++) does not compile with modern clang (two-phase template
# lookup errors in src/math/lp/*.h). When the z3 build fails, this
# script reports the limitation and exits non-zero instead of silently
# skipping analysis. Known workarounds:
#   - build z3javascript on a Linux host with an older GCC toolchain
#   - or use an older Xcode/clang that predates strict two-phase lookup
# CrossHair (Python) and the fast-check/Hypothesis property suites are
# the maintained soundness gates; ExpoSE is a best-effort extra pass.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXPOSE_DIR="$ROOT/tmp/ExpoSE"
HARNESS_OUT="$ROOT/tmp/symbolic-harnesses"
NODE_DIST="$ROOT/tmp/node-dist"
NODE_VERSION="21.7.2"

Z3JS_DIR="$EXPOSE_DIR/Analyser/node_modules/z3javascript"
Z3_DIR="$Z3JS_DIR/z3"

mkdir -p "$HARNESS_OUT"

if ! ls "$ROOT"/scripts/symbolic/harnesses/*.src.js >/dev/null 2>&1; then
  echo "no harnesses in scripts/symbolic/harnesses/ — nothing to do"
  exit 0
fi

if [ ! -d "$EXPOSE_DIR" ]; then
  echo "cloning ExpoSE into $EXPOSE_DIR"
  git clone --depth 1 https://github.com/ExpoSEJS/ExpoSE.git "$EXPOSE_DIR"
fi

# Pin node to the version ExpoSE declares in its engines field.
case "$(uname -s)/$(uname -m)" in
  Darwin/arm64) NODE_PLATFORM="darwin-arm64" ;;
  Darwin/x86_64) NODE_PLATFORM="darwin-x64" ;;
  Linux/x86_64) NODE_PLATFORM="linux-x64" ;;
  Linux/aarch64) NODE_PLATFORM="linux-arm64" ;;
  *) echo "ERROR: unsupported platform $(uname -s)/$(uname -m)" >&2; exit 1 ;;
esac
NODE_BIN="$NODE_DIST/node-v$NODE_VERSION-$NODE_PLATFORM/bin"
if [ ! -x "$NODE_BIN/node" ]; then
  echo "downloading node v$NODE_VERSION ($NODE_PLATFORM)"
  mkdir -p "$NODE_DIST"
  curl -fsSL "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-$NODE_PLATFORM.tar.gz" \
    | tar xz -C "$NODE_DIST"
fi
export PATH="$NODE_BIN:$PATH"
echo "using node $(node -v)"

if ! command -v bun >/dev/null 2>&1; then
  echo "ERROR: bun is required to bundle CJS harnesses" >&2
  exit 1
fi

# Build ExpoSE once (npm install + babel build of Distributor/Analyser).
# build_all is not used directly: its prettier step (a devDependency) is
# irrelevant for the build and npx is avoided — the repo-local
# node_modules/.bin is prepended to PATH instead.
if [ ! -f "$EXPOSE_DIR/Distributor/bin/Distributor.js" ]; then
  echo "building ExpoSE (one-time setup)"
  # shellcheck disable=SC1091  # build scripts only exist inside the cloned ExpoSE tree
  (cd "$EXPOSE_DIR" \
    && npm install --no-audit --no-fund --omit=dev \
    && export PATH="$EXPOSE_DIR/node_modules/.bin:$PATH" \
    && EXPOSE_LOG_LEVEL=1 . ./scripts/build/build_babelconfig > babel.config.js \
    && . ./scripts/build/build_libs \
    && . ./scripts/build/build Distributor src bin \
    && . ./scripts/build/build Analyser src bin \
    && ./scripts/build/bundle Analyser bin/Analyser.js bin/bundle.js \
    && rm babel.config.js)
fi

# Subpackage installs. Analyser/z3javascript are installed manually:
# z3javascript's postinstall clones z3 over SSH and runs a python build
# that assumes distutils (removed in python >= 3.12), so the pieces are
# assembled here over HTTPS with --ignore-scripts instead.
if [ ! -d "$EXPOSE_DIR/Distributor/node_modules" ]; then
  echo "installing Distributor dependencies"
  (cd "$EXPOSE_DIR/Distributor" && npm install --no-audit --no-fund --omit=dev)
fi
if [ ! -d "$EXPOSE_DIR/Analyser/node_modules" ]; then
  echo "installing Analyser dependencies (ignore-scripts)"
  (cd "$EXPOSE_DIR/Analyser" && npm install --no-audit --no-fund --ignore-scripts)
fi
if [ ! -d "$EXPOSE_DIR/Analyser/node_modules/jalangi2/node_modules" ]; then
  echo "installing jalangi2 dependencies"
  (cd "$EXPOSE_DIR/Analyser/node_modules/jalangi2" && npm install --no-audit --no-fund)
fi
if [ ! -d "$Z3JS_DIR" ]; then
  echo "cloning z3javascript"
  git clone https://github.com/ExpoSEJS/z3javascript.git "$Z3JS_DIR"
  (cd "$Z3JS_DIR" && npm install --no-audit --no-fund --ignore-scripts)
fi
if [ ! -d "$Z3_DIR" ]; then
  echo "cloning the vendored z3 fork (8f3b923)"
  git clone https://github.com/ExpoSEJS/z3.git "$Z3_DIR"
  git -C "$Z3_DIR" checkout 8f3b923
fi

z3_built() {
  [ -e "$Z3JS_DIR/bin/libz3.dylib" ] || [ -e "$Z3JS_DIR/bin/libz3.so" ]
}

if ! z3_built; then
  echo "building z3 (cmake; may fail on modern clang — see header comment)"
  (
    cd "$Z3_DIR" \
      && rm -rf build \
      && cmake -S . -B build -DCMAKE_POLICY_VERSION_MINIMUM=3.5 \
      && cmake --build build --parallel "$(sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)" \
      && cp build/libz3* "$Z3JS_DIR/bin/"
  ) || true
fi

if ! z3_built; then
  cat >&2 <<'EOF'
ERROR: the vendored z3 fork could not be built on this machine.

The ExpoSEJS/z3 fork (8f3b923) is 2019-era C++ and modern clang rejects
it (two-phase template lookup errors in src/math/lp/*.h). ExpoSE
analysis cannot run without libz3.

Workarounds:
  - run this script on Linux with an older GCC toolchain
  - or install an older Xcode command-line tools release
The CrossHair pass (scripts/symbolic/run-crosshair.sh) and the property
suites (pnpm test / uv run --group test pytest) remain the soundness
gates and run everywhere.
EOF
  exit 1
fi

# JS-side ffi bindings are plain file concatenations (no native build).
if [ ! -f "$Z3JS_DIR/bin/z3_bindings_built.js" ] || [ ! -f "$Z3JS_DIR/bin/package.js" ]; then
  echo "assembling z3javascript ffi bindings"
  (cd "$Z3JS_DIR" \
    && ./scripts/copy_bindings \
    && ./scripts/binds \
    && cp ./bin/z3_bindings_ref.js ./bin/package.js)
fi

FAILED=0
for harness in "$ROOT"/scripts/symbolic/harnesses/*.src.js; do
  name="$(basename "$harness" .src.js)"
  bun build "$harness" --format=cjs --outfile "$HARNESS_OUT/$name.cjs"
  # Concrete-mode smoke run: every harness executes standalone (J$ absent)
  # and prints "ok" before any symbolic machinery gets involved.
  echo "=== concrete smoke: $name ==="
  node "$HARNESS_OUT/$name.cjs"
  echo "=== ExpoSE: $name ==="
  if (cd "$EXPOSE_DIR" && EXPOSE_MAX_TIME=60000 ./expoSE "$HARNESS_OUT/$name.cjs"); then
    echo "=== $name: OK ==="
  else
    echo "=== $name: ISSUES FOUND (see output above) ==="
    FAILED=1
  fi
done

exit "$FAILED"
