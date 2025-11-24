/**
 * Secure Opengrep installer
 * Downloads install.sh from pinned tag, verifies SHA256 hash, and executes it
 */

import https from 'https'
import crypto from 'crypto'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

// Configuration
const OPENGREP_VERSION = 'v1.11.5'
const INSTALL_SCRIPT_URL = `https://raw.githubusercontent.com/opengrep/opengrep/refs/tags/${OPENGREP_VERSION}/install.sh`
const EXPECTED_SHA256 = 'a74388d0aec282eddf15fc8d42884de6531e1fc5a7bdc3ac31863c854e974eee'

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
function isOpengrepInstalled () {
  try {
    const opengrepBin = path.join(os.homedir(), '.opengrep', 'cli', 'latest', 'opengrep')
    if (!fs.existsSync(opengrepBin)) {
      return false
    }

    // Verify it runs and reports the correct version
    const output = execSync(`"${opengrepBin}" --version`, { encoding: 'utf-8' }).trim()
    console.log(`Found existing opengrep: ${output}`)
    return output.includes(OPENGREP_VERSION.replace('v', ''))
  } catch (error) {
    return false
  }
}

/**
 * Main installation function
 */
export default async function installOpengrep () {
  // Add to PATH regardless (needed for subsequent steps)
  const opengrepPath = path.join(os.homedir(), '.opengrep', 'cli', 'latest')
  const githubPath = process.env.GITHUB_PATH

  if (githubPath) {
    fs.appendFileSync(githubPath, `${opengrepPath}\n`)
  }

  // Check if already installed
  if (isOpengrepInstalled()) {
    console.log(`✓ Opengrep ${OPENGREP_VERSION} already installed, skipping download`)
    return
  }

  console.log(`Downloading opengrep install script from ${OPENGREP_VERSION}...`)
  console.log(`URL: ${INSTALL_SCRIPT_URL}`)

  // Download install script
  const scriptContent = await downloadFile(INSTALL_SCRIPT_URL)
  console.log(`Downloaded ${scriptContent.length} bytes`)

  // Verify SHA256 hash
  const actualSHA256 = calculateSHA256(scriptContent)
  console.log(`Expected SHA256: ${EXPECTED_SHA256}`)
  console.log(`Actual SHA256:   ${actualSHA256}`)

  if (actualSHA256 !== EXPECTED_SHA256) {
    throw new Error('SHA256 hash mismatch! Install script may have been tampered with.')
  }

  console.log('✓ Hash verification passed')

  // Write script to temporary file
  const tmpDir = os.tmpdir()
  const scriptPath = path.join(tmpDir, `opengrep-install-${Date.now()}.sh`)
  fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 })

  console.log(`Executing install script to install ${OPENGREP_VERSION}...`)

  try {
    // Execute install script with version parameter
    execSync(`bash "${scriptPath}" -v ${OPENGREP_VERSION}`, {
      stdio: 'inherit',
      env: process.env
    })

    console.log('✓ Opengrep installed successfully')
  } finally {
    // Clean up temporary script
    fs.unlinkSync(scriptPath)
  }
}
