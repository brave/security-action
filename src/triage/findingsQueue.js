import { stableCaseId } from './verdict.js'

/**
 * Convert a raw opengrep --json payload into triage queue items.
 *
 * Production findings carry no ground truth, so every item is unlabeled;
 * the agentic verdict alone drives annotation or suppression downstream.
 * The generated caseJson mirrors the paper-artifact case shape so
 * formatTask renders an identical task prompt.
 */
export function opengrepFindingsToQueue (rawJson, { repoRoot, scanRoot = '.' } = {}) {
  const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson
  const results = Array.isArray(parsed?.results) ? parsed.results : []
  const items = []
  const skipped = []
  for (const result of results) {
    if (!result || typeof result.path !== 'string' || result.path === '') {
      skipped.push({ reason: 'missing path', result })
      continue
    }
    const line = result?.end?.line ?? result?.start?.line ?? 0
    const checkId = typeof result.check_id === 'string' && result.check_id !== '' ? result.check_id : 'unknown-rule'
    const caseJson = {
      case_id: `${checkId}:${result.path}:${line}`,
      folder_root: repoRoot,
      scan_root: scanRoot,
      tool: [checkId],
      file: result.path,
      raw_output: { Opengrep: [result] }
    }
    items.push({
      caseId: stableCaseId(caseJson),
      dataset: 'opengrep',
      label: null,
      cwe: extractCwe(result?.extra?.metadata?.cwe),
      caseJson,
      repoRoot
    })
  }
  return { items, skipped }
}

export function extractCwe (metadata) {
  if (typeof metadata !== 'string') return null
  const m = /CWE-(\d+)/.exec(metadata)
  return m ? m[1] : null
}
