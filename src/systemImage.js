/**
 * Prebuilt-image runtime guards.
 *
 * The action ships as an OCI image (ghcr.io/brave/security-action) that
 * bakes the pinned tools and the dependency caches captured at build
 * time. A manifest at /opt/brave-security/manifest.json describes them:
 *
 *   {
 *     "landrun_version": "v0.1.17",
 *     "opengrep_version": "v1.32.0",
 *     "reviewdog_version": "v0.17.5",
 *     "pnpm_lock_sha256": "<sha256 of pnpm-lock.yaml at build>",
 *     "uv_lock_sha256":   "<sha256 of uv.lock at build>"
 *   }
 *
 * Outside the image (plain runners, PR branches of this action) the
 * manifest does not exist and every helper degrades to "not baked", so
 * the network install path is unchanged. Job containers mount a fresh
 * $HOME per run, which is why the baked tools live in /usr/local/bin —
 * already on PATH — instead of $HOME.
 */

import crypto from 'crypto'

export const MANIFEST_PATH = process.env.BRAVE_SECURITY_MANIFEST || '/opt/brave-security/manifest.json'
export const SYSTEM_BIN_DIR = process.env.BRAVE_SECURITY_SYSTEM_BIN || '/usr/local/bin'

/**
 * Read the image manifest. Returns null when absent or malformed —
 * never throws: a missing manifest must not break the plain-runner path.
 */
export function readImageManifest (fsx, manifestPath = MANIFEST_PATH) {
  try {
    const manifest = JSON.parse(fsx.readFileSync(manifestPath, 'utf-8'))
    return (manifest && typeof manifest === 'object') ? manifest : null
  } catch {
    return null
  }
}

/**
 * SHA256 of a file as hex, or null when unreadable.
 */
export function fileSha256 (fsx, filePath) {
  try {
    return crypto.createHash('sha256').update(fsx.readFileSync(filePath)).digest('hex')
  } catch {
    return null
  }
}

/**
 * Baked-binary guard for the pinned installers.
 *
 * Returns the system path when the manifest pins the same version, the
 * binary exists and its digest matches the expected pin. A digest
 * mismatch throws `mismatchMessage` — fail closed, mirroring the
 * existing tamper handling of the on-disk installs. Returns null when
 * the image does not provide the tool at the pinned version; the caller
 * falls back to the network install.
 */
export function bakedBinary ({
  fsx,
  manifest,
  systemBinDir = SYSTEM_BIN_DIR,
  name,
  version,
  sha256,
  mismatchMessage
}) {
  if (!manifest || manifest[`${name}_version`] !== version) return null
  const bin = `${systemBinDir}/${name}`
  if (!fsx.existsSync(bin)) return null
  const actual = crypto.createHash('sha256').update(fsx.readFileSync(bin)).digest('hex')
  if (actual !== sha256) throw new Error(mismatchMessage)
  return bin
}

/**
 * Offline decision for the dependency syncs: true only when a manifest
 * exists and the checked-out lockfile still hashes to the value recorded
 * at image build time. A PR branch that changed the lockfile (or a plain
 * runner) keeps the online path.
 */
export function lockHashMatches ({ fsx, manifest, lockPath, key }) {
  if (!manifest) return false
  const actual = fileSha256(fsx, lockPath)
  return typeof manifest[key] === 'string' && actual !== null && manifest[key] === actual
}

/**
 * PATH scan used to skip installs that the environment already provides
 * (xmllint is baked into the image; plain runners still need apt).
 */
export function commandAvailable (name, { env = process.env, fsx } = {}) {
  if (!fsx) return false
  return String(env.PATH || '')
    .split(':')
    .filter(Boolean)
    .some(dir => fsx.existsSync(`${dir}/${name}`))
}
