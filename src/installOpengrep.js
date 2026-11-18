/**
 * Secure Opengrep installer
 * Downloads the pinned release asset directly, verifies its SHA256 (fail
 * closed) and places it at ~/.opengrep/cli/<version>/opengrep with a
 * `latest` symlink. No upstream install script is ever executed — the only
 * code that runs on the host is the checksum-verified opengrep binary.
 */

import crypto from 'crypto'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fetchWithRetry } from './fetchRetry.js'
import { readImageManifest, bakedBinary } from './systemImage.js'

export const OPENGREP_VERSION = 'v1.32.0'
// BEGIN opengrep binary pins (managed by updateOpengrepVersion.js)
export const OPENGREP_BIN_SHA256 = {
  'v1.32.0': {
    opengrep_manylinux_x86: '7360d60174880bd9214f2dfbe439b7bce82b7a3d44cfe945ba833c85cc8bda75',
    opengrep_manylinux_aarch64: 'dc6229319c0d68948733053786a5614873947e5ec1d4669cc0e94ae9038cb99d',
    opengrep_osx_arm64: 'e161746226bccef5b85c57611946fa21dc3b00a2dc2591343d6160af99397e2f'
  }
}
// END opengrep binary pins

const RELEASE_BASE = `https://github.com/opengrep/opengrep/releases/download/${OPENGREP_VERSION}`

// Release asset (dist) names as chosen by the upstream install script. Musl
// runners would need the musllinux dists; extend the map if a musl runner is
// ever introduced.
const DIST_BY_PLATFORM = {
  'linux-x64': 'opengrep_manylinux_x86',
  'linux-arm64': 'opengrep_manylinux_aarch64',
  'darwin-x64': 'opengrep_osx_x86',
  'darwin-arm64': 'opengrep_osx_arm64'
}

/**
 * Download content from URL (follows GitHub release redirects), retrying
 * transient failures (5xx, timeouts, network errors) with exponential
 * backoff; 4xx fails fast. Per-attempt fetch is fetchWithRetry's default,
 * overridable via the `_fetchOnce` test seam.
 */
async function downloadFile (url, fetchOnce, sleep) {
  return fetchWithRetry(url, { fetchOnce: fetchOnce || undefined, sleep: sleep || undefined })
}

/**
 * Calculate SHA256 hash of buffer
 */
function calculateSHA256 (buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/**
 * Check if opengrep is already installed and working
 */
function isOpengrepInstalled (exec, fsx, opengrepBin) {
  try {
    if (!fsx.existsSync(opengrepBin)) {
      return false
    }

    // Verify it runs and reports the correct version
    const output = exec(`"${opengrepBin}" --version`, { encoding: 'utf-8' }).trim()
    console.log(`Found existing opengrep: ${output}`)
    return output.includes(OPENGREP_VERSION.replace('v', ''))
  } catch (error) {
    return false
  }
}

/**
 * Resolve the release asset (dist) name for this platform. Fail closed when
 * the platform is unknown: no dist means no pinned digest to verify against.
 */
function resolveDist (distOverride) {
  return distOverride || DIST_BY_PLATFORM[`${process.platform}-${process.arch}`] || null
}

/**
 * Verify the binary at binPath matches the pinned SHA256 digest.
 * Missing digest or hash mismatch both throw — fail closed.
 */
function verifyInstalledBinary (fsx, binPath, expectedSha256, version, dist) {
  if (!expectedSha256) {
    throw new Error(`No pinned SHA256 digest for opengrep ${version} on ${dist}. ` +
      'Add it to OPENGREP_BIN_SHA256 in src/installOpengrep.js (or run src/updateOpengrepVersion.js).')
  }

  const actualSha256 = calculateSHA256(fsx.readFileSync(binPath))
  if (actualSha256 !== expectedSha256) {
    throw new Error('SHA256 hash mismatch! Opengrep binary may have been tampered with.')
  }

  console.log('✓ Binary SHA256 verification passed')
}

/**
 * Main installation function
 *
 * Test seams (all optional, default to real implementations):
 * - _exec: replaces execSync (command -> output)
 * - _download: replaces the whole download step (url -> Buffer)
 * - _fetchOnce: replaces the per-attempt fetch inside the retry loop
 *   ((url, {timeoutMs}) -> Buffer) — fault-injection seam for retries
 * - _sleep: replaces the inter-attempt backoff delay (ms -> Promise)
 * - _fs: replaces fs (existsSync/readFileSync/appendFileSync/writeFileSync/mkdirSync)
 * - _binPath: overrides the opengrep binary path (latest symlink)
 * - _binSha256: replaces the pinned binary digest map ({ [dist]: sha })
 * - _dist: overrides the resolved release asset (dist) name
 */
export default async function installOpengrep ({
  _exec = null,
  _download = null,
  _fetchOnce = null,
  _sleep = null,
  _fs = null,
  _binPath = null,
  _binSha256 = null,
  _dist = null
} = {}) {
  const exec = _exec || execSync
  const download = _download || ((url) => downloadFile(url, _fetchOnce, _sleep))
  const fsx = _fs || fs
  const digestMap = _binSha256 || OPENGREP_BIN_SHA256

  // Add to PATH regardless (needed for subsequent steps)
  const opengrepBin = _binPath || path.join(os.homedir(), '.opengrep', 'cli', 'latest', 'opengrep')
  const opengrepPath = path.dirname(opengrepBin)
  const cliDir = path.dirname(opengrepPath)
  const homeDir = path.dirname(path.dirname(cliDir))
  const instDir = path.join(cliDir, OPENGREP_VERSION)
  const instBin = path.join(instDir, 'opengrep')
  const latestDir = path.join(cliDir, 'latest')
  const githubPath = process.env.GITHUB_PATH

  // Fail closed before touching the network when no digest is pinned for
  // this release/platform combination.
  const dist = resolveDist(_dist)
  const expectedBinSha256 = digestMap?.[OPENGREP_VERSION]?.[dist]
  if (!expectedBinSha256) {
    throw new Error(`No pinned SHA256 digest for opengrep ${OPENGREP_VERSION} on ${dist}. ` +
      'Add it to OPENGREP_BIN_SHA256 in src/installOpengrep.js (or run src/updateOpengrepVersion.js).')
  }

  // Prebuilt image: reuse the binary baked at /usr/local/bin without any
  // network access. The digest check fails closed on a tampered image;
  // a stale image falls back to the network install below.
  const manifest = readImageManifest(fsx)
  const baked = bakedBinary({
    fsx,
    manifest,
    name: 'opengrep',
    version: OPENGREP_VERSION,
    sha256: expectedBinSha256,
    mismatchMessage: 'SHA256 hash mismatch! Opengrep binary may have been tampered with.'
  })
  if (baked) {
    console.log(`✓ opengrep ${OPENGREP_VERSION} baked into the image at ${baked}, skipping download`)
    return
  }

  if (githubPath) {
    fsx.appendFileSync(githubPath, `${opengrepPath}\n`)
  }

  // Check if already installed
  if (isOpengrepInstalled(exec, fsx, opengrepBin)) {
    console.log(`✓ Opengrep ${OPENGREP_VERSION} already installed, skipping download`)
    verifyInstalledBinary(fsx, opengrepBin, expectedBinSha256, OPENGREP_VERSION, dist)
    return
  }

  const assetUrl = `${RELEASE_BASE}/${dist}`
  console.log(`Downloading opengrep ${OPENGREP_VERSION} (${dist}) from ${assetUrl}`)

  // Download the pinned release asset directly — no install script runs.
  const binaryContent = await download(assetUrl)

  // Verify SHA256 hash before anything touches the filesystem.
  const actualSha256 = calculateSHA256(binaryContent)
  console.log(`Expected SHA256: ${expectedBinSha256}`)
  console.log(`Actual SHA256:   ${actualSha256}`)
  if (actualSha256 !== expectedBinSha256) {
    throw new Error('SHA256 hash mismatch! Opengrep binary may have been tampered with.')
  }
  console.log('✓ Hash verification passed')

  // Install: version directory + latest symlink, mirroring the upstream
  // install.sh layout so the reviewdog cache key and runners keep working.
  fsx.mkdirSync(instDir, { recursive: true })
  fsx.writeFileSync(instBin, binaryContent, { mode: 0o755 })
  exec(`ln -sfn "${instDir}" "${latestDir}"`)
  const localBin = path.join(homeDir, '.local', 'bin')
  if (fsx.existsSync(localBin)) {
    exec(`ln -sf "${latestDir}/opengrep" "${localBin}/opengrep"`)
  }

  // Smoke test the freshly installed binary (not the symlink) before
  // declaring success.
  let smoke = ''
  try {
    smoke = exec(`"${instBin}" --version`, { encoding: 'utf-8' }).trim()
  } catch (e) {
    console.error(`Smoke test exec failed: ${e.message}`)
  }
  if (!smoke || !smoke.includes(OPENGREP_VERSION.replace('v', ''))) {
    throw new Error('Installed opengrep binary failed the --version smoke test.')
  }

  console.log('✓ Opengrep installed successfully')
  verifyInstalledBinary(fsx, instBin, expectedBinSha256, OPENGREP_VERSION, dist)
}
