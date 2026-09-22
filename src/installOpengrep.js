/**
 * Secure Opengrep installer
 * Downloads the pinned release asset directly, verifies its SHA256 (fail
 * closed) and places it at ~/.opengrep/cli/<version>/opengrep with a
 * `latest` symlink. No upstream install script is ever executed — the only
 * code that runs on the host is the checksum-verified opengrep binary.
 */

import https from 'https'
import crypto from 'crypto'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const OPENGREP_VERSION = 'v1.30.0'
// BEGIN opengrep binary pins (managed by updateOpengrepVersion.js)
export const OPENGREP_BIN_SHA256 = {
  'v1.30.0': {
    opengrep_manylinux_x86: '35779bdd72e92129c8df2a77f0c55e8c08356801ea92591ef32108d6b28d564c',
    opengrep_manylinux_aarch64: 'a5d5a4a58ba5d46ff51e921663da1c2bba38f4b03987f4aeec87f16c6ad3ecae',
    opengrep_osx_arm64: '0f5bc3dec09d995c61331a4017b856ede508f90d95b018d95f1dc6166be89fdd'
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
 * Download content from URL (follows GitHub release redirects)
 */
function downloadFile (url) {
  return new Promise((resolve, reject) => {
    const follow = (target) => {
      https.get(target, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          response.resume()
          follow(response.headers.location)
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
    }
    follow(url)
  })
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
 * - _download: replaces downloadFile (url -> Buffer)
 * - _fs: replaces fs (existsSync/readFileSync/appendFileSync/writeFileSync/mkdirSync)
 * - _binPath: overrides the opengrep binary path (latest symlink)
 * - _binSha256: replaces the pinned binary digest map ({ [dist]: sha })
 * - _dist: overrides the resolved release asset (dist) name
 */
export default async function installOpengrep ({
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
