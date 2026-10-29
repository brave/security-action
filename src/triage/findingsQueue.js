import { stableCaseId } from './verdict.js'

/**
 * Convert the slim opengrep findings JSONL (one jq -c record per finding,
 * captured by the reviewdog runner between --json and the line-format
 * stage) into triage queue items.
 *
 * Production findings carry no ground truth, so every item is unlabeled;
 * the agentic verdict alone drives annotation or suppression downstream.
 * The generated caseJson mirrors the paper-artifact case shape so
 * formatTask renders an identical task prompt. Findings whose rule has
 * no CWE metadata stay in the queue with cwe: null; policyDecision
 * treats null like an allowlisted CWE.
 */
export function opengrepFindingsToQueue (slimJsonl, { repoRoot, scanRoot = '.' } = {}) {
  const records = Array.isArray(slimJsonl)
    ? slimJsonl
    : String(slimJsonl).split('\n').filter((l) => l.trim() !== '')
  const items = []
  const skipped = []
  for (const record of records) {
    let result
    try {
      result = typeof record === 'string' ? JSON.parse(record) : record
    } catch {
      skipped.push({ reason: 'malformed record', result: record })
      continue
    }
    if (!result || typeof result.path !== 'string' || result.path === '') {
      skipped.push({ reason: 'missing path', result })
      continue
    }
    const line = Number.isFinite(result.line) ? result.line : 0
    const checkId = typeof result.check_id === 'string' && result.check_id !== '' ? result.check_id : 'unknown-rule'
    const cwe = extractCwe(result.cwe)
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
      cwe,
      file: result.path,
      line,
      caseJson,
      repoRoot
    })
  }
  return { items, skipped }
}

export function extractCwe (metadata) {
  if (Array.isArray(metadata)) metadata = metadata[0]
  if (typeof metadata !== 'string') return null
  const m = /CWE-(\d+)/.exec(metadata)
  return m ? m[1] : null
}
