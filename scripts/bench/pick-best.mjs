#!/usr/bin/env node
/**
 * Pick the best condition per CWE cell across N complete runs over the SAME
 * seeded queue, then report the metrics of the resulting mixture.
 *
 * Usage:
 *   node scripts/bench/pick-best.mjs --runs a.jsonl b.jsonl ...
 *     [--min-n 10] [--min-delta 0.05] [--base agentic]
 *
 * Cells are computed on cases done in ALL runs sharing that CWE label
 * (intersection), so every cell is compared on identical cases. A run wins a
 * cell when its F1 beats the current best by >= --min-delta (default 0.05)
 * and the earlier-listed run is preferred on ties/small cells to avoid
 * overfitting. --base names the default winner (prefix match on the run name)
 * for cells where no clear margin exists.
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

const runPaths = process.argv.slice(process.argv.indexOf('--runs') + 1).filter((a) => a.endsWith('.jsonl'))
if (runPaths.length < 2) {
  console.error('usage: pick-best.mjs --runs a.jsonl b.jsonl ... [--min-n 10] [--min-delta 0.05] [--base NAME]')
  process.exit(1)
}
const minN = Number(arg('--min-n', 10))
const minDelta = Number(arg('--min-delta', 0.05))
const baseName = arg('--base', 'vanilla')

const runs = runPaths.map((p) => {
  const rows = loadRows(p)
  return {
    name: path.basename(p, '.jsonl').replace(/^z-ai__glm-5\.3-flash-/, ''),
    byCase: new Map(rows.map((r) => [r.caseId, r]))
  }
})
for (const r of runs) {
  const missing = runs.filter((o) => o !== r && [...o.byCase.keys()].some((id) => !r.byCase.has(id))).length
  if (missing) console.log(`note: ${r.name} missing cases done by ${missing} other run(s)`)
}

// universe: cases done in ALL runs
const universe = [...runs[0].byCase.keys()].filter((id) => runs.every((r) => r.byCase.has(id)))
console.log(`universe (done in all ${runs.length} runs): n=${universe.length}`)
const perCase = universe.map((id) => runs.map((r) => r.byCase.get(id)))

// group by cwe
const byCwe = new Map()
for (const rowset of perCase) {
  const cwe = rowset[0].cwe ?? 'None'
  if (!byCwe.has(cwe)) byCwe.set(cwe, [])
  byCwe.get(cwe).push(rowset)
}

console.log(`\npick base=${baseName} minN=${minN} minDelta=${minDelta}`)
console.log('cwe\tn\t' + runs.map((r) => r.name).join('\t') + '\twinner')
const mix = { fp: 0, tp: 0, correctFp: 0, predictedFp: 0, keptTp: 0, cost: 0 }
const costs = runs.map(() => 0)
const winners = new Map()
for (const [cwe, rowsets] of [...byCwe.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const n = rowsets.length
  const stats = runs.map((_, ri) => {
    const c = cells(rowsets.map((rs) => rs[ri]))
    const tot = { n, fp: 0, tp: 0, correctFp: 0, predictedFp: 0, keptTp: 0, cost: 0 }
    for (const v of c.values()) { tot.fp += v.fp; tot.tp += v.tp; tot.correctFp += v.correctFp; tot.predictedFp += v.predictedFp; tot.keptTp += v.keptTp; tot.cost += v.cost }
    const rec = tot.fp ? tot.correctFp / tot.fp : 0
    const prec = tot.predictedFp ? tot.correctFp / tot.predictedFp : 0
    return { rec, prec, f1: f1(rec, prec), tpRet: tot.tp ? tot.keptTp / tot.tp : 0, raw: tot }
  })
  let best = runs.findIndex((r) => r.name.startsWith(baseName))
  if (best < 0) best = 0
  for (let i = 0; i < runs.length; i++) {
    if (i === best) continue
    if (n >= minN && stats[i].f1 - stats[best].f1 >= minDelta) best = i
  }
  winners.set(cwe, runs[best].name)
  const w = stats[best].raw
  mix.fp += w.fp; mix.tp += w.tp; mix.correctFp += w.correctFp; mix.predictedFp += w.predictedFp; mix.keptTp += w.keptTp; mix.cost += w.cost
  costs[best] += w.cost
  const row = [cwe, n, ...stats.map((s) => `${s.f1.toFixed(2)}/${s.tpRet.toFixed(2)}`), runs[best].name]
  console.log(row.join('\t'))
}

const mixRec = mix.fp ? mix.correctFp / mix.fp : 0
const mixPrec = mix.predictedFp ? mix.correctFp / mix.predictedFp : 0
console.log('\nMIX:')
console.log(`  fpRecall    ${mixRec.toFixed(3)}`)
console.log(`  fpPrecision ${mixPrec.toFixed(3)}`)
console.log(`  F1          ${f1(mixRec, mixPrec).toFixed(3)}`)
console.log(`  TP-ret      ${(mix.tp ? mix.keptTp / mix.tp : 0).toFixed(3)}`)
console.log(`  cost        $${mix.cost.toFixed(2)} (${runs.map((r, i) => `${r.name} $${costs[i].toFixed(2)}`).join(', ')})`)
console.log(`\nwinners: ${[...winners.entries()].map(([c, w]) => `${c}:${w}`).join('  ')}`)

// single-run references on the same universe
console.log('\nsingle runs (same universe):')
for (const r of runs) {
  const c = cells(universe.map((id) => r.byCase.get(id)))
  const tot = { fp: 0, tp: 0, correctFp: 0, predictedFp: 0, keptTp: 0 }
  for (const v of c.values()) { tot.fp += v.fp; tot.tp += v.tp; tot.correctFp += v.correctFp; tot.predictedFp += v.predictedFp; tot.keptTp += v.keptTp }
  const rec = tot.fp ? tot.correctFp / tot.fp : 0
  const prec = tot.predictedFp ? tot.correctFp / tot.predictedFp : 0
  console.log(`  ${r.name}: fpRec ${rec.toFixed(3)} prec ${prec.toFixed(3)} F1 ${f1(rec, prec).toFixed(3)} tpRet ${(tot.tp ? tot.keptTp / tot.tp : 0).toFixed(3)}`)
}
