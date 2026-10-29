import { stableCaseId } from './verdict.js'

/**
 * Convert reviewdog log lines into triage queue items.
 *
 * Every finding line carries its metadata inside the Category comment
 * the runner template embeds (`<!-- Category: X, CWE: CWE-N..., Rule:
 * check_id -->`), so no side-channel capture file is needed and every
 * runner (opengrep, sveltegrep, safesvg, npm-audit, pip-audit) flows
 * through the same parser. Lines without a comment triage with
 * cwe: null; policyDecision treats null like an allowlisted CWE.
 *
 * Production findings carry no ground truth, so every item is unlabeled;
 * the agentic verdict alone drives annotation or suppression downstream.
 * The generated caseJson mirrors the paper-artifact case shape so
 * formatTask renders an identical task prompt.
 */
const LINE_RE = /^([A-Z]):(.+?):(\d+) (.*)$/
const META_RE = /<!-- Category: ([^,>]*), CWE: (.*?), Rule: ([^ >]*) -->/

export function logLinesToQueue (logLines, { repoRoot, scanRoot = '.', runner = 'opengrep' } = {}) {
  const items = []
  const skipped = []
  const lines = Array.isArray(logLines) ? logLines : String(logLines).split('\n')
  for (const raw of lines) {
    if (raw.trim() === '') continue
    const m = LINE_RE.exec(raw)
    if (!m) {
      skipped.push({ reason: 'unparseable line', line: raw })
      continue
    }
    const [, , filePath, lineNo, message] = m
    const meta = META_RE.exec(raw)
    const rule = meta && meta[3] !== '' ? meta[3] : runner
    const cwe = meta ? extractCwe(meta[2]) : null
    const line = Number(lineNo)
    // strip the reviewdog line markup: message is cut at the Source comment
    const cleanMessage = message.split('<br><br>Source:')[0]
    const caseJson = {
      case_id: `${rule}:${filePath}:${line}`,
      folder_root: repoRoot,
      scan_root: scanRoot,
      tool: [rule],
      file: filePath,
      raw_output: {
        [rule]: [{ check_id: rule, path: filePath, line, message: cleanMessage }]
      }
    }
    items.push({
      caseId: stableCaseId(caseJson),
      dataset: runner,
      label: null,
      cwe,
      file: filePath,
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
