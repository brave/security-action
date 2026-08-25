/**
 * Secure Opengrep installer
 * Downloads install.sh from a pinned upstream commit, verifies SHA256, and
 * executes it with the desired Opengrep version.
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
const OPENGREP_VERSION = 'v1.11.5'
const INSTALL_SCRIPT_COMMIT = '0b445193f95b14b828bc3ede8fea9725feb45e64'
const INSTALL_SCRIPT_URL = `https://raw.githubusercontent.com/opengrep/opengrep/${INSTALL_SCRIPT_COMMIT}/install.sh`
const EXPECTED_SHA256 = '4643968d05a2d5f9d4130c0c170fc096d6adf8131aca002ba2fd0e482ac52d0d'

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
 * Main installation function
 *
 * Test seams (all optional, default to real implementations):
 * - _exec: replaces execSync (command -> output)
 * - _download: replaces downloadFile (url -> Buffer)
 * - _fs: replaces fs (existsSync/appendFileSync/writeFileSync/unlinkSync)
 * - _binPath: overrides the opengrep binary path
 * - _expectedSha256: overrides the pinned hash expectation
 */
export default async function installOpengrep ({
  _exec = null,
  _download = null,
  _fs = null,
  _binPath = null,
  _expectedSha256 = null
} = {}) {
  const exec = _exec || execSync
  const download = _download || downloadFile
  const fsx = _fs || fs
  const expectedSha256 = _expectedSha256 || EXPECTED_SHA256

  // Add to PATH regardless (needed for subsequent steps)
  const opengrepBin = _binPath || path.join(os.homedir(), '.opengrep', 'cli', 'latest', 'opengrep')
  const opengrepPath = path.dirname(opengrepBin)
  const githubPath = process.env.GITHUB_PATH

  if (githubPath) {
    fsx.appendFileSync(githubPath, `${opengrepPath}\n`)
  }

  // Check if already installed
  if (isOpengrepInstalled(exec, fsx, opengrepBin)) {
    console.log(`✓ Opengrep ${OPENGREP_VERSION} already installed, skipping download`)
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
}
