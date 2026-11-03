#!/usr/bin/env node
/**
 * Compute the best per-CWE mix between two complete runs (e.g. vanilla vs
 * full-tools agentic) over the SAME queue. For every CWE cell the script picks
 * the run whose cell F1 is higher (ties -> first run) and reports the metrics
 * of the resulting mixture plus the per-cell deltas.
 *
 * Usage:
 *   node scripts/bench/mix-cwe.mjs --a <vanilla.jsonl> --b <tools.jsonl>
 *     [--min-n 10] [--min-delta 0.1] [--pick-b-all]
 *
 * --min-n / --min-delta only switch a cell to the second run when the margin
 * is clear; otherwise the first run wins the tie. This avoids overfitting
 * tiny cells. --pick-b-all ignores the margins and always takes the better
 * cell F1.
 */
import fs from 'node:fs'
import path from 'node:path'

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const loadRows = (p) => fs.readFileSync(path.resolve(p), 'utf8').split('\n').filter(Boolean)
  .map((l) => JSON.parse(l))
  .filter((r) => r.stopped === 'done' && r.verdict?.label && r.verdict.label !== 'UNKNOWN')

const label = (r) => (typeof r.verdict === 'string' ? r.verdict : r.verdict.label)

const cells = (rows) => {
  const m = new Map()
  for (const r of rows) {
    const cwe = r.cwe ?? 'None'
    const c = m.get(cwe) ?? { n: 0, fp: 0, tp: 0, correctFp: 0, predictedFp: 0, keptTp: 0, cost: 0 }
    c.n += 1
    c.cost += r.cost ?? r.usage?.cost ?? 0
    if (r.label === 'FP') {
      c.fp += 1
      if (label(r) === 'FP') { c.correctFp += 1; c.predictedFp += 1 }
    } else if (r.label === 'TP') {
      c.tp += 1
      if (label(r) === 'FP') c.predictedFp += 1
      if (label(r) === 'TP') c.keptTp += 1
    }
    m.set(cwe, c)
  }
  return m
}

const f1 = (rec, prec) => (rec + prec === 0 ? 0 : 2 * rec * prec / (rec + prec))

// args
const aPath = arg('--a')
const bPath = arg('--b')
if (!aPath || !bPath) {
  console.error('usage: mix-cwe.mjs --a <runA.jsonl> --b <runB.jsonl> [--min-n 10] [--min-delta 0.1]')
  process.exit(1)
}
const minN = Number(arg('--min-n', 10))
const minDelta = Number(arg('--min-delta', 0.1))
const pickBAll = process.argv.includes('--pick-b-all')

const a = loadRows(aPath)
const b = loadRows(bPath)
const byCaseA = new Map(a.map((r) => [r.caseId, r]))
const byCaseB = new Map(b.map((r) => [r.caseId, r]))

// universe = cases present (done) in either run
const caseIds = new Set([...byCaseA.keys(), ...byCaseB.keys()])
const shared = [...caseIds].filter((id) => byCaseA.has(id) && byCaseB.has(id))
const onlyA = [...caseIds].filter((id) => !byCaseB.has(id))
const onlyB = [...caseIds].filter((id) => !byCaseA.has(id))
if (onlyA.length || onlyB.length) {
  console.log(`note: ${onlyA.length} cases only in A, ${onlyB.length} only in B (not done in one run) — excluded from mix`)
}

const ca = cells(shared.map((id) => byCaseA.get(id)))
const cb = cells(shared.map((id) => byCaseB.get(id)))

const cwes = [...new Set([...ca.keys(), ...cb.keys()])].sort()
console.log('cwe\tn\tfpA->tpRecA\tprecA\tf1A\ttpRetA\tfpRecB\tprecB\tf1B\ttpRetB\tpick\tmixRec\tmixPrec\tmixF1\tmixTpRet')
const mix = { fp: 0, tp: 0, correctFp: 0, predictedFp: 0, keptTp: 0, cost: 0 }
let costA = 0
let costB = 0
for (const cwe of cwes) {
  const x = ca.get(cwe) ?? { n: 0, fp: 0, tp: 0, correctFp: 0, predictedFp: 0, keptTp: 0, cost: 0 }
  const y = cb.get(cwe) ?? { n: 0, fp: 0, tp: 0, correctFp: 0, predictedFp: 0, keptTp: 0, cost: 0 }
  const recA = x.fp ? x.correctFp / x.fp : 0
  const precA = x.predictedFp ? x.correctFp / x.predictedFp : 0
  const recB = y.fp ? y.correctFp / y.fp : 0
  const precB = y.predictedFp ? y.correctFp / y.predictedFp : 0
  const f1A = f1(recA, precA)
  const f1B = f1(recB, precB)
  const tprA = x.tp ? x.keptTp / x.tp : 0
  const tprB = y.tp ? y.keptTp / y.tp : 0
  const pickB = pickBAll ? f1B > f1A : (f1B - f1A >= minDelta && y.n >= minN)
  const w = pickB ? y : x
  mix.fp += w.fp; mix.tp += w.tp; mix.correctFp += w.correctFp; mix.predictedFp += w.predictedFp; mix.keptTp += w.keptTp
  if (pickB) costB += y.cost; else costA += x.cost
  console.log(`${cwe}\t${x.n}\t${recA.toFixed(2)}\t${precA.toFixed(2)}\t${f1A.toFixed(2)}\t${tprA.toFixed(2)}\t${recB.toFixed(2)}\t${precB.toFixed(2)}\t${f1B.toFixed(2)}\t${tprB.toFixed(2)}\t${pickB ? 'B' : 'A'}\t${(w.fp ? w.correctFp / w.fp : 0).toFixed(2)}\t${(w.predictedFp ? w.correctFp / w.predictedFp : 0).toFixed(2)}\t${f1(w.fp ? w.correctFp / w.fp : 0, w.predictedFp ? w.correctFp / w.predictedFp : 0).toFixed(2)}\t${(w.tp ? w.keptTp / w.tp : 0).toFixed(2)}`)
}

const mixRec = mix.fp ? mix.correctFp / mix.fp : 0
const mixPrec = mix.predictedFp ? mix.correctFp / mix.predictedFp : 0
console.log('\nMIX:')
console.log(`  fpRecall    ${mixRec.toFixed(3)}`)
console.log(`  fpPrecision ${mixPrec.toFixed(3)}`)
console.log(`  F1          ${f1(mixRec, mixPrec).toFixed(3)}`)
console.log(`  TP-ret      ${(mix.tp ? mix.keptTp / mix.tp : 0).toFixed(3)}`)
console.log(`  cells->B    ${cwes.filter((c) => { const x = ca.get(c) ?? {}; const y = cb.get(c) ?? {}; const f1A = f1(x.fp ? x.correctFp / x.fp : 0, x.predictedFp ? x.correctFp / x.predictedFp : 0); const f1B = f1(y.fp ? y.correctFp / y.fp : 0, y.predictedFp ? y.correctFp / y.predictedFp : 0); return pickBAll ? f1B > f1A : (f1B - f1A >= minDelta && (y.n ?? 0) >= minN) }).join(', ') || '(none)'}`)
console.log(`  cost A part $${costA.toFixed(2)} / B part $${costB.toFixed(2)}`)

const all = (rows) => {
  const c = cells(rows)
  let fp = 0; let tp = 0; let cf = 0; let pf = 0; let kt = 0
  for (const v of c.values()) { fp += v.fp; tp += v.tp; cf += v.correctFp; pf += v.predictedFp; kt += v.keptTp }
  const rec = fp ? cf / fp : 0
  const prec = pf ? cf / pf : 0
  return `fpRec ${rec.toFixed(3)} prec ${prec.toFixed(3)} F1 ${f1(rec, prec).toFixed(3)} tpRet ${(tp ? kt / tp : 0).toFixed(3)}`
}
console.log(`\nA alone (shared cases): ${all(shared.map((id) => byCaseA.get(id)))}`)
console.log(`B alone (shared cases): ${all(shared.map((id) => byCaseB.get(id)))}`)
