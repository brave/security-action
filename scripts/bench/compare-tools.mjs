#!/usr/bin/env node
/**
 * Per-CWE comparison of N single-tool ablation runs against a baseline run,
 * all over the same seeded queue.
 *
 * Usage:
 *   node scripts/bench/compare-tools.mjs --base <baseline.jsonl> --runs <a.jsonl> <b.jsonl> ... [--md]
 *
 * For every CWE cell prints the baseline cell F1 and each run's cell F1 with
 * the delta, restricted to cases done in BOTH the baseline and that run.
 */
import fs from 'node:fs'
import path from 'node:path'

const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const asMd = process.argv.includes('--md')

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
const stat = (c) => {
  const rec = c.fp ? c.correctFp / c.fp : 0
  const prec = c.predictedFp ? c.correctFp / c.predictedFp : 0
  return { rec, prec, f1: f1(rec, prec), tpRet: c.tp ? c.keptTp / c.tp : 0 }
}

const name = (p) => path.basename(p, '.jsonl').replace(/^z-ai__glm-5\.3-flash-/, '')
const baseP = arg('--base')
const runPs = process.argv.slice(process.argv.indexOf('--runs') + 1).filter((a) => a.endsWith('.jsonl'))
if (!baseP || runPs.length === 0) {
  console.error('usage: compare-tools.mjs --base <baseline.jsonl> --runs <a.jsonl> ...')
  process.exit(1)
}

const base = loadRows(baseP)
const baseByCase = new Map(base.map((r) => [r.caseId, r]))
const baseCells = cells(base)
const runs = runPs.map((p) => {
  const rows = loadRows(p)
  const byCase = new Map(rows.map((r) => [r.caseId, r]))
  return { p: name(p), byCase, cells: cells(rows) }
})

const cwes = [...baseCells.keys()].sort((a, b) => (baseCells.get(b)?.n ?? 0) - (baseCells.get(a)?.n ?? 0))
const cols = ['base', ...runs.map((r) => r.p)]
const sep = asMd ? '|' : '\t'
console.log(['cwe', 'n', ...cols.flatMap((c) => [`${c} F1`, `${c} tpRet`, `${c} rec`])].join(sep))
for (const cwe of cwes) {
  const b = baseCells.get(cwe)
  const bs = stat(b)
  const out = [cwe, b.n, bs.f1.toFixed(2), bs.tpRet.toFixed(2), bs.rec.toFixed(2)]
  for (const r of runs) {
    const c = r.cells.get(cwe)
    if (!c) { out.push('-', '-', '-'); continue }
    const s = stat(c)
    const d = s.f1 - bs.f1
    out.push(`${s.f1.toFixed(2)}(${d >= 0 ? '+' : ''}${d.toFixed(2)})`, s.tpRet.toFixed(2), s.rec.toFixed(2))
  }
  console.log(out.join(sep))
}

// global over shared-done cases per run
console.log('\nglobal (done-in-both with baseline):')
const g = (rows) => {
  const c = cells(rows)
  let fp = 0; let tp = 0; let cf = 0; let pf = 0; let kt = 0
  for (const v of c.values()) { fp += v.fp; tp += v.tp; cf += v.correctFp; pf += v.predictedFp; kt += v.keptTp }
  const s = stat({ fp, tp, correctFp: cf, predictedFp: pf, keptTp: kt })
  return `rec ${s.rec.toFixed(3)} prec ${s.prec.toFixed(3)} F1 ${s.f1.toFixed(3)} tpRet ${s.tpRet.toFixed(3)}`
}
const bg = g(base)
console.log(`  ${name(baseP)}: ${bg}`)
for (const r of runs) {
  const shared = [...r.byCase.keys()].filter((id) => baseByCase.has(id)).map((id) => r.byCase.get(id))
  console.log(`  ${r.p}: ${g(shared)} (n=${shared.length})`)
}
