# syntax=docker/dockerfile:1
#
# Prebuilt runtime image for brave/security-action.
#
# The composite action (actions/main/action.yml) normally installs its
# toolchain at runtime — landrun, opengrep, reviewdog, python + uv
# (modelscan/tensorflow), pnpm — from GitHub releases, PyPI and npm.
# That runtime network surface is exactly what dies during Azure mirror
# incidents (actions/runner-images#14823). This image bakes every tool
# at /usr/local/bin plus a content-addressed pnpm store and uv cache,
# so a matching checkout needs zero tool-network access:
#
#   /usr/local/bin/{landrun,opengrep,reviewdog,uv,node,npm,pnpm,...}
#   /opt/pnpm/store       baked from pnpm-lock.yaml (offline install)
#   /opt/uv-cache         baked from uv.lock (offline sync)
#   /opt/uv-python        uv-managed python for the venv
#   /opt/brave-security/manifest.json  versions + lockfile hashes;
#       actions/main/action.yml + src/systemImage.js gate on it to pick
#       the baked tools and skip downloads (hash mismatch falls back to
#       the network install; tampered binaries fail closed).
#
# The action code itself is NOT baked: `uses: brave/security-action/...`
# checks out the action repo into the workspace, so action PR branches
# keep working against this image (lockfile hash mismatch → online
# fallback). Baked as root (job containers must not set USER —
# actions/checkout#956) on ubuntu:24.04 for glibc compatibility with
# the runner-injected node externals.
#
# Build args are injected by .github/workflows/image.yml, which computes
# them from the same source files the installers read — no duplicated
# pins here.

FROM ubuntu:24.04

ARG LANDRUN_VERSION
ARG LANDRUN_SHA256
# Asset names default to amd64 (the published image platform); the arm64
# variants exist only for local multi-arch smoke builds.
ARG LANDRUN_ASSET=landrun-linux-amd64
ARG OPENGREP_VERSION
ARG OPENGREP_SHA256
ARG OPENGREP_ASSET=opengrep_manylinux_x86
ARG REVIEWDOG_VERSION
ARG REVIEWDOG_SHA256
ARG REVIEWDOG_ASSET=Linux_x86_64
ARG PNPM_VERSION

ENV DEBIAN_FRONTEND=noninteractive \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8

# ruby → assets/cleaner.rb (reviewdog runners), libxml2-utils → xmllint
# (safesvg), jq → brakeman runner, python3 = 3.12 on 24.04.
RUN apt-get update -qq \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    jq \
    libxml2-utils \
    python3 \
    python3-venv \
    ruby \
    xz-utils \
  && rm -rf /var/lib/apt/lists/*

# Node from the official image (the runner does not inject node into job
# containers). npm/npx are symlinks into the copied node_modules tree.
# corepack is not shipped: inside the image every pnpm invocation uses the
# baked pnpm binary; corepack is only a host-mode concern.
COPY --from=node:24-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
  && npm install -g "pnpm@${PNPM_VERSION}" \
  && npm cache clean --force

# uv (copied from the upstream image; no install script runs).
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
COPY --from=ghcr.io/astral-sh/uv:latest /uvx /usr/local/bin/uvx

# landrun — pinned release asset, verified digest, no remote script.
# No exec smoke test here: running landrun needs a Landlock-capable
# kernel, which some local builders (OrbStack) do not provide; the
# digest check plus scripts/with-sandbox.sh's runtime probe cover it.
RUN curl -fsSL --retry 5 --retry-all-errors --retry-delay 2 \
    -o /usr/local/bin/landrun \
    "https://github.com/Zouuup/landrun/releases/download/${LANDRUN_VERSION}/${LANDRUN_ASSET}" \
  && echo "${LANDRUN_SHA256}  /usr/local/bin/landrun" | sha256sum -c - \
  && chmod 0755 /usr/local/bin/landrun

# opengrep — pinned release asset (raw manylinux binary), verified digest.
RUN curl -fsSL --retry 5 --retry-all-errors --retry-delay 2 \
    -o /usr/local/bin/opengrep \
    "https://github.com/opengrep/opengrep/releases/download/${OPENGREP_VERSION}/${OPENGREP_ASSET}" \
  && echo "${OPENGREP_SHA256}  /usr/local/bin/opengrep" | sha256sum -c - \
  && chmod 0755 /usr/local/bin/opengrep \
  && /usr/local/bin/opengrep --version

# reviewdog — pinned release tarball, verified digest (mirrors
# scripts/install-reviewdog.sh).
RUN V="${REVIEWDOG_VERSION#v}" \
  && curl -fsSL --retry 5 --retry-all-errors --retry-delay 2 \
    -o /tmp/reviewdog.tar.gz \
    "https://github.com/reviewdog/reviewdog/releases/download/${REVIEWDOG_VERSION}/reviewdog_${V}_${REVIEWDOG_ASSET}.tar.gz" \
  && echo "${REVIEWDOG_SHA256}  /tmp/reviewdog.tar.gz" | sha256sum -c - \
  && tar --no-same-owner -xzf /tmp/reviewdog.tar.gz -C /usr/local/bin reviewdog \
  && rm -f /tmp/reviewdog.tar.gz \
  && chmod 0755 /usr/local/bin/reviewdog \
  && reviewdog --version

# Bake the full pnpm store from the lockfile (dev dependencies included —
# the runtime `pnpm install --frozen-lockfile` installs them too). The
# store is content-addressed, so the workspace install runs offline from
# /opt/pnpm/store. node_modules itself is not kept: the workspace gets a
# fresh install against the store. pnpm-workspace.yaml (resolution
# overrides) must be present or --frozen-lockfile resolution diverges.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /opt/brave-security/build/
RUN pnpm install --frozen-lockfile --dir /opt/brave-security/build \
    --store-dir /opt/pnpm/store \
  && rm -rf /opt/brave-security/build/node_modules

# Bake the uv cache (default + modelscan + tensorflow groups) and the
# uv-managed python. Runtime `uv sync --offline` rebuilds the venv in the
# workspace from these; env vars persist into the job container so the
# sandbox grants in src/uvSyncSandbox.js bind to the baked paths.
ENV UV_CACHE_DIR=/opt/uv-cache \
    UV_PYTHON_INSTALL_DIR=/opt/uv-python
COPY pyproject.toml uv.lock /opt/brave-security/build/
RUN uv sync --frozen --group modelscan --group tensorflow \
    --project /opt/brave-security/build \
  && rm -rf /opt/brave-security/build/.venv

# Manifest consumed by src/systemImage.js + actions/main/action.yml:
# baked tool versions and the lockfile hashes the offline paths gated on.
# Binary presence + digests are re-verified at runtime (fail closed).
RUN printf '{\n  "landrun_version": "%s",\n  "opengrep_version": "%s",\n  "reviewdog_version": "%s",\n  "pnpm_lock_sha256": "%s",\n  "uv_lock_sha256": "%s"\n}\n' \
    "${LANDRUN_VERSION}" \
    "${OPENGREP_VERSION}" \
    "${REVIEWDOG_VERSION}" \
    "$(sha256sum /opt/brave-security/build/pnpm-lock.yaml | cut -d' ' -f1)" \
    "$(sha256sum /opt/brave-security/build/uv.lock | cut -d' ' -f1)" \
    > /opt/brave-security/manifest.json \
  && cat /opt/brave-security/manifest.json

# Smoke test the baked toolchain (excluding landrun — kernel-dependent).
RUN node --version && npm --version && pnpm --version \
  && python3 --version && uv --version \
  && ruby --version && xmllint --version 2>&1 | head -n1 \
  && jq --version && git --version
