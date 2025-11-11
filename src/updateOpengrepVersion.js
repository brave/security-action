/**
 * Update opengrep version in installOpengrep.js
 * This script fetches the latest opengrep release and updates:
 * - OPENGREP_VERSION constant
 * - EXPECTED_SHA256 hash of the install.sh script
 */

import https from 'https'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INSTALL_SCRIPT = path.join(__dirname, 'installOpengrep.js')

/**
 * Fetch latest release from GitHub API
 */
function fetchLatestRelease () {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/opengrep/opengrep/releases/latest',
      headers: {
        'User-Agent': 'opengrep-updater',
        Accept: 'application/vnd.github.v3+json'
      }
    }

    https.get(options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch release: HTTP ${response.statusCode}`))
        return
      }

      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString())
          resolve(data)
        } catch (error) {
          reject(error)
        }
      })
      response.on('error', reject)
    }).on('error', reject)
  })
}

/**
 * Download content from URL
 */
function downloadFile (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
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
 * Get current version from installOpengrep.js
 */
function getCurrentVersion () {
  const content = fs.readFileSync(INSTALL_SCRIPT, 'utf-8')
  const match = content.match(/const OPENGREP_VERSION = '(v[\d.]+)'/)
  return match ? match[1] : null
}

/**
 * Update version and hash in installOpengrep.js
 */
function updateInstallScript (version, sha256Hash) {
  let content = fs.readFileSync(INSTALL_SCRIPT, 'utf-8')

  // Update version
  content = content.replace(
    /const OPENGREP_VERSION = 'v[\d.]+'/,
    `const OPENGREP_VERSION = '${version}'`
  )

  // Update SHA256 hash
  content = content.replace(
    /const EXPECTED_SHA256 = '[a-f0-9]{64}'/,
    `const EXPECTED_SHA256 = '${sha256Hash}'`
  )

  fs.writeFileSync(INSTALL_SCRIPT, content)
  console.log(`✓ Updated ${path.relative(path.join(__dirname, '..'), INSTALL_SCRIPT)}`)
}

/**
 * Main update function
 */
export default async function updateOpengrepVersion () {
  try {
    console.log('Fetching latest opengrep release...')
    const release = await fetchLatestRelease()
    const latestVersion = release.tag_name

    console.log(`Latest version: ${latestVersion}`)

    const currentVersion = getCurrentVersion()
    console.log(`Current version: ${currentVersion}`)

    if (currentVersion === latestVersion) {
      console.log('✓ Already up to date!')
      return {
        updated: false,
        currentVersion,
        latestVersion
      }
    }

    console.log(`Updating from ${currentVersion} to ${latestVersion}...`)

    // Download install script and calculate hash
    const installScriptUrl = `https://raw.githubusercontent.com/opengrep/opengrep/refs/tags/${latestVersion}/install.sh`
    console.log(`Downloading install script from ${installScriptUrl}...`)

    const scriptContent = await downloadFile(installScriptUrl)
    const sha256Hash = calculateSHA256(scriptContent)

    console.log(`Calculated SHA256: ${sha256Hash}`)

    // Update file
    updateInstallScript(latestVersion, sha256Hash)

    console.log('\n✓ File updated successfully!')

    return {
      updated: true,
      oldVersion: currentVersion,
      newVersion: latestVersion
    }
  } catch (error) {
    console.error('Error:', error.message)
    throw error
  }
}
