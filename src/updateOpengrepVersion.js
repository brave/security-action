/**
 * Update opengrep version in installOpengrep.js
 * This script fetches the latest opengrep release and updates:
 * - OPENGREP_VERSION constant
 * - EXPECTED_SHA256 hash of the pinned install.sh script
 * - OPENGREP_BIN_SHA256 binary digests (per pinned dist), downloaded from the
 *   release so a version bump always ships matching binary pins
 * - the opengrep cache key in actions/main/action.yml
 *
 * install.sh is pinned to a fixed upstream commit (not the tag) because old tags
 * ship an install.sh that rejects versions via the unpaginated GitHub API
 * (opengrep/opengrep#792). New versions install via that pinned script.
 */

import https from 'https'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INSTALL_SCRIPT = path.join(__dirname, 'installOpengrep.js')
const ACTION_YML = path.join(__dirname, '..', 'actions', 'main', 'action.yml')

// Release assets (dists) we actually run opengrep on: CI (ubuntu-latest,
// glibc x64) and darwin arm64 dev machines. Must match DIST_BY_PLATFORM in
// src/installOpengrep.js for those platforms.
const PINNED_DISTS = ['opengrep_manylinux_x86', 'opengrep_osx_arm64']

const INSTALL_SCRIPT_URL = 'https://raw.githubusercontent.com/opengrep/opengrep/0b445193f95b14b828bc3ede8fea9725feb45e64/install.sh'

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
function getCurrentVersion (fsx) {
  const content = fsx.readFileSync(INSTALL_SCRIPT, 'utf-8')
  const match = content.match(/const OPENGREP_VERSION = '(v[\d.]+)'/)
  return match ? match[1] : null
}

/**
 * Get the release tag the binary pins block currently covers
 */
function getPinnedBinariesVersion (fsx) {
  const content = fsx.readFileSync(INSTALL_SCRIPT, 'utf-8')
  const match = content.match(/OPENGREP_BIN_SHA256 = \{\s*'([^']+)'/)
  return match ? match[1] : null
}

/**
 * Get the opengrep version pinned in the action.yml cache key
 */
function getCacheKeyVersion (fsx) {
  const content = fsx.readFileSync(ACTION_YML, 'utf-8')
  const match = content.match(/key: opengrep-(v[\d.]+)-/)
  return match ? match[1] : null
}

/**
 * Update version, install script hash and binary pins in installOpengrep.js
 */
function updateInstallScript (version, sha256Hash, binaryDigests, fsx) {
  let content = fsx.readFileSync(INSTALL_SCRIPT, 'utf-8')

  // Update version
  content = content.replace(
    /const OPENGREP_VERSION = 'v[\d.]+'/,
    `const OPENGREP_VERSION = '${version}'`
  )

  // Update SHA256 hash of the pinned install script
  content = content.replace(
    /const EXPECTED_SHA256 = '[a-f0-9]{64}'/,
    `const EXPECTED_SHA256 = '${sha256Hash}'`
  )

  // Regenerate the binary pins block for the new version
  const entries = PINNED_DISTS.map(dist => `    ${dist}: '${binaryDigests[dist]}'`).join(',\n')
  const block = '// BEGIN opengrep binary pins (managed by updateOpengrepVersion.js)\n' +
    `const OPENGREP_BIN_SHA256 = {\n  '${version}': {\n${entries}\n  }\n}\n` +
    '// END opengrep binary pins\n'
  if (/\/\/ BEGIN opengrep binary pins/.test(content)) {
    content = content.replace(
      /\/\/ BEGIN opengrep binary pins[\s\S]*?\/\/ END opengrep binary pins\n/,
      block
    )
  } else {
    // No pins block yet (pre-digest-pinning installOpengrep.js): insert one
    // right after the install script hash constant.
    content = content.replace(
      /(const EXPECTED_SHA256 = '[a-f0-9]{64}'\n)/,
      `$1\n${block}`
    )
  }

  fsx.writeFileSync(INSTALL_SCRIPT, content)
  console.log(`✓ Updated ${path.relative(path.join(__dirname, '..'), INSTALL_SCRIPT)}`)
}

/**
 * Point the action.yml cache key at the pinned version
 */
function updateCacheKey (version, fsx) {
  const content = fsx.readFileSync(ACTION_YML, 'utf-8')
  const updated = content.replace(
    /key: opengrep-v[\d.]+-/,
    `key: opengrep-${version}-`
  )
  if (updated !== content) {
    fsx.writeFileSync(ACTION_YML, updated)
    console.log(`✓ Updated ${path.relative(path.join(__dirname, '..'), ACTION_YML)} cache key`)
  }
}

/**
 * Download the release binaries for the pinned dists and return their digests
 */
async function fetchBinaryDigests (version, download) {
  const digests = {}
  for (const dist of PINNED_DISTS) {
    const url = `https://github.com/opengrep/opengrep/releases/download/${version}/${dist}`
    console.log(`Downloading ${dist} from ${url}...`)
    const content = await download(url)
    digests[dist] = calculateSHA256(content)
    console.log(`${dist}: ${digests[dist]}`)
  }
  return digests
}

/**
 * Main update function
 *
 * Test seams (all optional, default to real implementations):
 * - _fetchRelease: replaces fetchLatestRelease (-> release object)
 * - _download: replaces downloadFile (url -> Buffer)
 * - _fs: replaces fs (readFileSync/writeFileSync)
 */
export default async function updateOpengrepVersion ({
  _fetchRelease = null,
  _download = null,
  _fs = null
} = {}) {
  const fetchRelease = _fetchRelease || fetchLatestRelease
  const download = _download || downloadFile
  const fsx = _fs || fs

  try {
    console.log('Fetching latest opengrep release...')
    const release = await fetchRelease()
    const latestVersion = release.tag_name

    console.log(`Latest version: ${latestVersion}`)

    const currentVersion = getCurrentVersion(fsx)
    console.log(`Current version: ${currentVersion}`)

    const pinnedBinariesVersion = getPinnedBinariesVersion(fsx)
    const cacheKeyVersion = getCacheKeyVersion(fsx)

    const needsVersion = currentVersion !== latestVersion
    const needsPins = pinnedBinariesVersion !== latestVersion
    const needsCacheKey = cacheKeyVersion !== latestVersion

    if (!needsVersion && !needsPins && !needsCacheKey) {
      console.log('✓ Already up to date!')
      return {
        updated: false,
        currentVersion,
        latestVersion
      }
    }

    console.log(`Updating from ${currentVersion} to ${latestVersion}...`)

    // Download the pinned install script and calculate its hash.
    // The script is pinned to a specific commit instead of the tag; see
    // src/installOpengrep.js for the rationale.
    console.log(`Downloading pinned install script from ${INSTALL_SCRIPT_URL}...`)

    const scriptContent = await download(INSTALL_SCRIPT_URL)
    const sha256Hash = calculateSHA256(scriptContent)

    console.log(`Calculated SHA256: ${sha256Hash}`)

    // Pin the binaries for the version we are switching to, so the version
    // bump and its binary digests always land in the same commit.
    const binaryDigests = await fetchBinaryDigests(latestVersion, download)

    // Update files
    updateInstallScript(latestVersion, sha256Hash, binaryDigests, fsx)
    updateCacheKey(latestVersion, fsx)

    console.log('\n✓ Files updated successfully!')

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
