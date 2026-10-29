/**
 * Phase A/B metrics over labeled triage results.
 * A row: { label: 'FP'|'TP', verdict: 'FP'|'TP'|'UNKNOWN', cwe?, cost? }
 *
 * FP recall: share of true FPs the filter labels FP (suppression quality).
 * FP precision: share of predicted FPs that are true FPs.
 * TP retention: share of true TPs NOT suppressed (kept as TP) — the paper's
 * catastrophic-regression metric.
 */

function safeDiv (num, den) {
  return den === 0 ? 0 : num / den
}

// Runner rows may carry a full verdict object and cost nested in usage;
// accept both shapes so artifact rows and hand-built rows behave alike.
function verdictLabel (r) {
  return typeof r.verdict === 'string' ? r.verdict : r.verdict?.label
}

function rowCost (r) {
  return r.cost ?? r.usage?.cost ?? 0
}

export function computeMetrics (results) {
  const rows = results ?? []
  const total = rows.length
  const fpPool = rows.filter(r => r.label === 'FP')
  const tpPool = rows.filter(r => r.label === 'TP')
  const predictedFp = rows.filter(r => verdictLabel(r) === 'FP')
  const tpKept = tpPool.filter(r => verdictLabel(r) === 'TP')

  const fpRecall = safeDiv(fpPool.filter(r => verdictLabel(r) === 'FP').length, fpPool.length)
  const fpPrecision = safeDiv(predictedFp.filter(r => r.label === 'FP').length, predictedFp.length)
  const f1 = fpRecall + fpPrecision === 0 ? 0 : 2 * fpRecall * fpPrecision / (fpRecall + fpPrecision)
  const tpRetention = safeDiv(tpKept.length, tpPool.length)
  const unknownRate = safeDiv(rows.filter(r => verdictLabel(r) === 'UNKNOWN').length, total)
  const totalCost = rows.reduce((sum, r) => sum + rowCost(r), 0)

  const byCwe = {}
  for (const r of rows) {
    const cwe = String(r.cwe ?? 'unknown')
    byCwe[cwe] = byCwe[cwe] ?? { n: 0, fp: 0, tp: 0, predictedFp: 0, keptTp: 0 }
    const b = byCwe[cwe]
    b.n++
    if (r.label === 'FP') b.fp++
    if (r.label === 'TP') b.tp++
    if (verdictLabel(r) === 'FP') b.predictedFp++
    if (r.label === 'TP' && verdictLabel(r) === 'TP') b.keptTp++
  }
  for (const cwe of Object.keys(byCwe)) {
    const b = byCwe[cwe]
    b.fpRecall = safeDiv(b.predictedFp, b.fp)
    b.tpRetention = safeDiv(b.keptTp, b.tp)
  }

  return { fpRecall, fpPrecision, f1, tpRetention, unknownRate, totalCost, byCwe }
}
