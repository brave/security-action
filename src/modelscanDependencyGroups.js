/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Decide which modelscan dependency groups uv must sync for this run.
 *
 * Groups (pyproject.toml):
 *   modelscan   modelscan + numpy + h5py        (~20MB over pip-audit-only;
 *              numpy is a hard modelscan dep, h5py is only ~5MB more)
 *   tensorflow  tensorflow for keras/saved_model (~685MB with transitive deps)
 *
 * The uv cache rarely helps: the action does not run on the default branch,
 * so PR runs usually start with a cold cache. Installing only what the PR
 * needs keeps most runs at the pip-audit-only footprint (~6MB).
 *
 * Returns ['modelscan'] when any changed file has a model suffix and
 * modelscan is enabled, plus 'tensorflow' when a .keras/.pb file is present
 * and the keras/saved_model scanner is enabled. SEC_ACTION_MODELSCAN_HEAVY
 * forces both groups — for model-hosting repos.
 *
 * Suffix detection is a heuristic (files with model magic but odd suffixes
 * are missed) — the audit script still magic-checks file contents before
 * scanning, this only gates dependency installation.
 *
 * @param {Object} opts
 * @param {String[]} opts.changedFiles     Repo-relative changed file paths
 * @param {String}   opts.modelscanEnabled  modelscan_enabled option ('all',
 *                     comma-separated scanner list, or 'false')
 * @param {Object}   opts.env               Env vars (default process.env)
 * @returns {String[]} Groups to pass to `uv sync --group ...`
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Mirror of the suffix table in assets/modelscan-audit.py
const MODEL_SUFFIXES = [
  '.pkl', '.pickle', '.joblib', '.dill', '.dat', '.data', // pickle
  '.npy', // numpy
  '.bin', '.pt', '.pth', '.ckpt', // pytorch
  '.h5' // h5
]

const TENSORFLOW_SUFFIXES = ['.keras', '.pb']

export default function modelscanDependencyGroups ({
  changedFiles = [],
  modelscanEnabled = 'all',
  env = process.env
} = {}) {
  const list = (modelscanEnabled || 'all').trim().toLowerCase()
  if (!list || list === 'false') return []

  const scanners = list === 'all' ? null : list.split(',').map(s => s.trim()).filter(Boolean)

  const hasSuffix = suffixes => changedFiles.some(file =>
    suffixes.some(suffix => file.toLowerCase().endsWith(suffix))
  )

  const groups = []
  if (hasSuffix(MODEL_SUFFIXES)) groups.push('modelscan')

  const tensorflowScannerEnabled = scanners === null ||
    scanners.includes('keras') || scanners.includes('saved_model')
  if (tensorflowScannerEnabled && hasSuffix(TENSORFLOW_SUFFIXES)) {
    if (!groups.includes('modelscan')) groups.push('modelscan')
    groups.push('tensorflow')
  }

  const envHeavy = env.SEC_ACTION_MODELSCAN_HEAVY
  if (envHeavy && envHeavy !== 'false') {
    return ['modelscan', 'tensorflow']
  }

  return groups
}
