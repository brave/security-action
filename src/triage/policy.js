/**
 * Suppression policy gate.
 *
 * The paper's TP-retention analysis shows flash-tier agents almost never
 * misclassify injection-family findings as false positives (TP-retention:
 * CWE-78 2.4%, CWE-89 1.1%, CWE-79 0.4%), while policy/crypto families
 * suffer catastrophic suppression (CWE-327 77%, CWE-328 84.5%, CWE-501
 * 77%). Suppression is therefore gated to the injection allowlist AND
 * high-confidence verdicts AND non-empty evidence. Everything else is
 * annotated for human review; confirmed TPs are left to reviewdog.
 */
export const DEFAULT_SUPPRESS_CWES = ['78', '79', '89']

export function policyDecision (verdict, { cwe = null, allowCwes } = {}) {
  const allow = Array.isArray(allowCwes) ? allowCwes : DEFAULT_SUPPRESS_CWES
  if (
    verdict?.label === 'FP' &&
    verdict.confidence === 'high' &&
    Array.isArray(verdict.evidence) &&
    verdict.evidence.length > 0 &&
    cwe !== null &&
    allow.includes(String(cwe))
  ) return 'suppress'
  if (verdict?.label === 'TP') return 'keep'
  return 'annotate'
}
