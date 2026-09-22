/**
 * Secure landrun installer.
 * Downloads the pinned release asset directly (no remote install script),
 * writes it to ~/.landrun/bin and verifies its SHA256 digest on install and
 * on every reuse (fail closed). landrun wraps the kernel Landlock LSM and is
 * used by scripts/with-sandbox.sh to confine untrusted tool runs.
 */

import https from 'https'
import crypto from 'crypto'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

// landrun v0.1.17 targets Landlock ABI v9 in strict mode; the sandbox wrapper
// always passes --best-effort so older runner kernels degrade gracefully.
export const LANDRUN_VERSION = 'v0.1.17'
const RELEASE_BASE = `https://github.com/Zouuup/landrun/releases/download/${LANDRUN_VERSION}`

// BEGIN landrun binary pins
const LANDRUN_BIN_SHA256 = {
  [LANDRUN_VERSION]: {
    'landrun-linux-amd64': '6ada66a06669e8994e174a7271af2db636308e55a0d6ec896cc7d326b46727f6',
    'landrun-linux-arm64': '365d8c8656c732b14d70e621d972cb733e490621fb5b9c0876376bcf457dbb5d'
  }
}
// END landrun binary pins

// Release asset (dist) names exactly as published on the GitHub release.
// macOS is intentionally unsupported: Landlock is a Linux LSM, so the
// wrapper degrades locally on darwin.
const DIST_BY_PLATFORM = {
  'linux-x64': 'landrun-linux-amd64',
  'linux-arm64': 'landrun-linux-arm64'
}

/**
 * Download content from URL
 */
function downloadFile (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // GitHub release assets redirect (302) to the CDN — follow, like
      // updateOpengrepVersion.js does.
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`))
        return
      }

      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    }).on('error', reject)
  })
}

/**
 * Calculate SHA256 hash of buffer
 */
function calculateSHA256 (buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/**
 * Resolve the release asset (dist) name for this platform. Fail closed when
 * the platform is unknown: no dist means no pinned digest to verify against.
 */
function resolveDist (distOverride) {
  return distOverride || DIST_BY_PLATFORM[`${process.platform}-${process.arch}`] || null
}

/**
 * Verify the installed binary matches the pinned SHA256 digest.
 * The caller guarantees a digest was pinned (fail-closed pre-check);
 * a hash mismatch throws — fail closed.
 */
function verifyInstalledBinary (fsx, bin, expectedSha256) {
  const actualSha256 = calculateSHA256(fsx.readFileSync(bin))
  if (actualSha256 !== expectedSha256) {
    throw new Error('SHA256 hash mismatch! Landrun binary may have been tampered with.')
  }

  console.log('✓ Binary SHA256 verification passed')
}

/**
 * Check if landrun is already installed and working
 */
function isLandrunInstalled (exec, fsx, bin) {
  try {
    if (!fsx.existsSync(bin)) {
      return false
    }

    // Verify it runs and reports the correct version
    const output = exec(`"${bin}" --version`, { encoding: 'utf-8' }).trim()
    console.log(`Found existing landrun: ${output}`)
    return output.includes(LANDRUN_VERSION.replace('v', ''))
  } catch (error) {
    return false
  }
}

/**
 * Main installation function
 *
 * Test seams (all optional, default to real implementations):
 * - _exec: replaces execSync (command -> output)
 * - _download: replaces downloadFile (url -> Buffer)
 * - _fs: replaces fs (existsSync/mkdirSync/readFileSync/appendFileSync/writeFileSync)
 * - _binPath: overrides the landrun binary path
 * - _binSha256: replaces the pinned binary digest map ({ [dist]: sha })
 * - _dist: overrides the resolved release asset (dist) name
 */
export default async function installLandrun ({
  _exec = null,
  _download = null,
  _fs = null,
  _binPath = null,
  _binSha256 = null,
  _dist = null
} = {}) {
  const exec = _exec || execSync
  const download = _download || downloadFile
  const fsx = _fs || fs
  const digestMap = _binSha256 || LANDRUN_BIN_SHA256

  const bin = _binPath || path.join(os.homedir(), '.landrun', 'bin', 'landrun')
  const binDir = path.dirname(bin)
  const githubPath = process.env.GITHUB_PATH

  // Fail closed before touching the network when no digest is pinned for
  // this release/platform combination.
  const dist = resolveDist(_dist)
  const expectedSha256 = digestMap?.[LANDRUN_VERSION]?.[dist]
  if (!expectedSha256) {
    throw new Error(`No pinned SHA256 digest for landrun ${LANDRUN_VERSION} on ${dist}. ` +
      'Add it to LANDRUN_BIN_SHA256 in src/installLandrun.js.')
  }

  if (githubPath) {
    fsx.appendFileSync(githubPath, `${binDir}\n`)
  }

  // Check if already installed
  if (isLandrunInstalled(exec, fsx, bin)) {
    console.log(`✓ landrun ${LANDRUN_VERSION} already installed, skipping download`)
    verifyInstalledBinary(fsx, bin, expectedSha256)
    return
  }

  const url = `${RELEASE_BASE}/${dist}`
  console.log(`Downloading landrun ${LANDRUN_VERSION} from ${url}...`)

  const content = await download(url)
  fsx.mkdirSync(binDir, { recursive: true })
  fsx.writeFileSync(bin, content, { mode: 0o755 })

  verifyInstalledBinary(fsx, bin, expectedSha256)

  // Sanity check: the freshly installed binary must run and report the pin.
  const output = exec(`"${bin}" --version`, { encoding: 'utf-8' }).trim()
  if (!output.includes(LANDRUN_VERSION.replace('v', ''))) {
    throw new Error(`landrun ${LANDRUN_VERSION} did not report the pinned version after install: ${output}`)
  }

  console.log(`✓ landrun ${LANDRUN_VERSION} installed successfully: ${output}`)
}
