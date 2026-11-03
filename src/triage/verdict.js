import { createHash } from 'node:crypto'

export const VERDICT_LABELS = ['TP', 'FP', 'UNKNOWN']
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low']

/**
 * Stable case id: prefer an explicit case_id, else derive a sha1 fingerprint
 * from tool/file/scan_root/raw_output (mirrors the paper's make_task.py).
 */
export function stableCaseId (caseJson) {
  const cid = caseJson && typeof caseJson.case_id === 'string' ? caseJson.case_id.trim() : ''
  if (cid) return cid
  let tool = caseJson?.tool ?? null
  if (typeof tool === 'string') tool = [tool]
  const payload = {
    tool,
    file: caseJson?.file,
    scan_root: caseJson?.scan_root,
    raw_output: caseJson?.raw_output
  }
  const h = createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 12)
  return `case-${h}`
}

/** Strip ``` / ```json fences a model may have wrapped its JSON in. */
function stripFences (text) {
  const m = String(text ?? '').trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return (m ? m[1] : String(text ?? '')).trim()
}

function invalid (error) {
  return { ok: false, error }
}

/**
 * Parse and validate a final verdict payload against the paper's schema.
 * Returns {ok, verdict} or {ok:false, error} where error is a short token:
 * json | label | confidence | confidence_score | reason | evidence | shape.
 * caseId / agent are authoritative overrides when provided.
 */
export function parseVerdict (payload, { caseId, agent } = {}) {
  let obj
  if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
    obj = payload
  } else {
    try {
      obj = JSON.parse(stripFences(payload))
    } catch {
      return invalid('json')
    }
  }
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return invalid('shape')

  if (!VERDICT_LABELS.includes(obj.label)) return invalid('label')
  if (!CONFIDENCE_LEVELS.includes(obj.confidence)) return invalid('confidence')
  if (typeof obj.confidence_score !== 'number' || !Number.isFinite(obj.confidence_score) ||
      obj.confidence_score < 0 || obj.confidence_score > 1) return invalid('confidence_score')
  if (typeof obj.reason !== 'string' || !obj.reason.trim()) return invalid('reason')

  let evidence = obj.evidence ?? []
  if (!Array.isArray(evidence)) return invalid('evidence')
  if (obj.label !== 'UNKNOWN' && evidence.length < 1) return invalid('evidence')
  evidence = evidence.map(ev => ({
    file: typeof ev?.file === 'string' ? ev.file : '',
    lines: ev?.lines ?? null,
    note: typeof ev?.note === 'string' ? ev.note : ''
  }))

  const verdict = {
    label: obj.label,
    confidence: obj.confidence,
    confidence_score: obj.confidence_score,
    reason: obj.reason,
    evidence,
    agent: agent ?? (typeof obj.agent === 'string' ? obj.agent : 'triage-agent'),
    case_id: caseId ?? (typeof obj.case_id === 'string' ? obj.case_id : '')
  }
  return { ok: true, verdict }
}

/** Forced UNKNOWN verdict used when the loop cannot complete a decision. */
export function unknownVerdict ({ caseId, agent, reason }) {
  return {
    label: 'UNKNOWN',
    confidence: 'low',
    confidence_score: 0,
    reason,
    evidence: [],
    agent: agent ?? 'triage-agent',
    case_id: caseId ?? ''
  }
}
