/**
 * Secure Opengrep installer
 * Downloads install.sh from a pinned upstream commit, verifies SHA256, and
 * executes it with the desired Opengrep version. The downloaded binary itself
 * is SHA256-pinned per release tag and platform dist, and verified after
 * every install and reuse (fail closed): install.sh only verifies the binary
 * via cosign when cosign is present, which CI runners cannot rely on.
 */

import https from 'https'
import crypto from 'crypto'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

// Configuration
// install.sh pinned to commit 0b44519 (opengrep/opengrep#796): tag scripts
// reject versions past the first releases API page (opengrep/opengrep#792).
// TODO: drop the pin once opengrep >=v1.28.0 ships the fixed script in a tag.
export const OPENGREP_VERSION = 'v1.30.0'
const INSTALL_SCRIPT_COMMIT = '0b445193f95b14b828bc3ede8fea9725feb45e64'
const INSTALL_SCRIPT_URL = `https://raw.githubusercontent.com/opengrep/opengrep/${INSTALL_SCRIPT_COMMIT}/install.sh`
const EXPECTED_SHA256 = '4643968d05a2d5f9d4130c0c170fc096d6adf8131aca002ba2fd0e482ac52d0d'

// BEGIN opengrep binary pins (managed by updateOpengrepVersion.js)
const OPENGREP_BIN_SHA256 = {
  'v1.30.0': {
    opengrep_manylinux_x86: '35779bdd72e92129c8df2a77f0c55e8c08356801ea92591ef32108d6b28d564c',
    opengrep_osx_arm64: '0f5bc3dec09d995c61331a4017b856ede508f90d95b018d95f1dc6166be89fdd'
  }
}
// END opengrep binary pins

// Release asset (dist) names as chosen by install.sh. Musl runners would need
// the musllinux dists; extend the map if a musl runner is ever introduced.
const DIST_BY_PLATFORM = {
  'linux-x64': 'opengrep_manylinux_x86',
  'linux-arm64': 'opengrep_manylinux_aarch64',
  'darwin-x64': 'opengrep_osx_x86',
  'darwin-arm64': 'opengrep_osx_arm64'
}

/**
 * Download content from URL
 */
function downloadFile (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
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
 * Verify the installed binary matches the pinned SHA256 digest.
 * Missing digest or hash mismatch both throw — fail closed.
 */
function verifyInstalledBinary (fsx, opengrepBin, expectedSha256, version, dist) {
  if (!expectedSha256) {
    throw new Error(`No pinned SHA256 digest for opengrep ${version} on ${dist}. ` +
      'Add it to OPENGREP_BIN_SHA256 in src/installOpengrep.js (or run src/updateOpengrepVersion.js).')
  }

  const actualSha256 = calculateSHA256(fsx.readFileSync(opengrepBin))
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
 * - _fs: replaces fs (existsSync/readFileSync/appendFileSync/writeFileSync/unlinkSync)
 * - _binPath: overrides the opengrep binary path
 * - _expectedSha256: overrides the pinned install.sh hash expectation
 * - _binSha256: replaces the pinned binary digest map ({ [dist]: sha })
 * - _dist: overrides the resolved release asset (dist) name
 */
export default async function installOpengrep ({
  _exec = null,
  _download = null,
  _fs = null,
  _binPath = null,
  _expectedSha256 = null,
  _binSha256 = null,
  _dist = null
} = {}) {
  const exec = _exec || execSync
  const download = _download || downloadFile
  const fsx = _fs || fs
  const expectedSha256 = _expectedSha256 || EXPECTED_SHA256
  const digestMap = _binSha256 || OPENGREP_BIN_SHA256

  // Add to PATH regardless (needed for subsequent steps)
  const opengrepBin = _binPath || path.join(os.homedir(), '.opengrep', 'cli', 'latest', 'opengrep')
  const opengrepPath = path.dirname(opengrepBin)
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

  console.log(`Downloading opengrep install script from ${OPENGREP_VERSION}...`)
  console.log(`URL: ${INSTALL_SCRIPT_URL}`)

  // Download install script
  const scriptContent = await download(INSTALL_SCRIPT_URL)
  console.log(`Downloaded ${scriptContent.length} bytes`)

  // Verify SHA256 hash
  const actualSHA256 = calculateSHA256(scriptContent)
  console.log(`Expected SHA256: ${expectedSha256}`)
  console.log(`Actual SHA256:   ${actualSHA256}`)

  if (actualSHA256 !== expectedSha256) {
    throw new Error('SHA256 hash mismatch! Install script may have been tampered with.')
  }

  console.log('✓ Hash verification passed')

  // Write script to temporary file
  const tmpDir = os.tmpdir()
  const scriptPath = path.join(tmpDir, `opengrep-install-${Date.now()}.sh`)
  fsx.writeFileSync(scriptPath, scriptContent, { mode: 0o755 })

  console.log(`Executing install script to install ${OPENGREP_VERSION}...`)

  try {
    // Execute install script with version parameter
    exec(`bash "${scriptPath}" -v ${OPENGREP_VERSION}`, {
      stdio: 'inherit',
      env: process.env
    })

    console.log('✓ Opengrep installed successfully')
  } finally {
    // Clean up temporary script
    fsx.unlinkSync(scriptPath)
  }

  // The binary was just placed by install.sh; verify it matches the pin.
  verifyInstalledBinary(fsx, opengrepBin, expectedBinSha256, OPENGREP_VERSION, dist)
}
