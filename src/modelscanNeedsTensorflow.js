/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Decide whether the heavyweight tensorflow dependency group must be
 * installed for this run (uv sync --group tensorflow).
 *
 * tensorflow is ~500MB — it is only needed by the keras (.keras) and
 * saved_model (.pb) scanners. Installing it on every run would dominate
 * the job time, and the uv cache rarely helps: the action does not run on
 * the default branch, so PR runs usually start with a cold cache.
 *
 * Install the group only when:
 *   - modelscan itself is enabled (modelscan_enabled), AND
 *   - the keras or saved_model scanner is enabled, AND
 *   - a changed file actually has a tensorflow-model suffix (.keras/.pb)
 *
 * OR when the env var SEC_ACTION_MODELSCAN_HEAVY is set to a truthy value —
 * for repositories that always include model files and want the group
 * installed unconditionally.
 *
 * @param {Object} opts
 * @param {String[]} opts.changedFiles   Repo-relative changed file paths
 * @param {String}   opts.modelscanEnabled modelscan_enabled option ('all',
 *                   comma-separated scanner list, or 'false')
 * @param {Object}   opts.env            Env vars (default process.env)
 * @returns {Boolean}
 * ─────────────────────────────────────────────────────────────────────────────
 */
const TENSORFLOW_SUFFIXES = ['.keras', '.pb']

export default function modelscanNeedsTensorflow ({
  changedFiles = [],
  modelscanEnabled = 'all',
  env = process.env
} = {}) {
  const list = (modelscanEnabled || 'all').trim().toLowerCase()
  if (!list || list === 'false') return false

  const envHeavy = env.SEC_ACTION_MODELSCAN_HEAVY
  if (envHeavy && envHeavy !== 'false') return true

  const scanners = list === 'all' ? null : list.split(',').map(s => s.trim()).filter(Boolean)
  if (scanners && !scanners.includes('keras') && !scanners.includes('saved_model')) return false

  return changedFiles.some(file =>
    TENSORFLOW_SUFFIXES.some(suffix => file.toLowerCase().endsWith(suffix))
  )
}
