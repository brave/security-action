#!/usr/bin/env node
/**
 * Case-level chain verdict for phase D: join the generation run (LLM-driven
 * findings from the knowledge base) with its postfilter run and score the
 * full chain against the oracle at CASE granularity (not finding granularity).
 *
 * Usage:
 *   node scripts/bench/chain-verdict.mjs --gen <gen.jsonl> --pf <postfilter.jsonl>
 *
 * Semantics (verdict FP = suppress, TP = keep):
 *   TP case kept   iff >= 1 matching-cwe generated finding survives (verdict TP)
 *   FP case clean  iff generator emitted nothing OR postfilter suppressed all
 *                  its findings; kept noise = false alarm
 */
import fs from 'node:fs'
import path from 'node:path'

const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const genPath = arg('--gen')
const pfPath = arg('--pf')
if (!genPath || !pfPath) {
  console.error('usage: chain-verdict.mjs --gen <gen.jsonl> --pf <postfilter.jsonl>')
  process.exit(1)
}

const load = (p) => fs.readFileSync(path.resolve(p), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
const lab = (r) => (typeof r.verdict === 'string' ? r.verdict : r.verdict.label)

const gen = load(genPath)
const pf = load(pfPath).filter((r) => r.stopped === 'done' && r.verdict?.label && r.verdict.label !== 'UNKNOWN')
const suppressed = new Set(pf.filter((r) => lab(r) === 'FP').map((r) => r.caseId))

let tpCases = 0
let tpKept = 0
let fpCases = 0
let fpClean = 0
const det = { genSilent: 0, allSuppressed: 0, keptNoise: 0 }
for (const r of gen) {
  if (r.label === 'TP') {
    tpCases++
    const keptMatch = r.findings.some((f) => f.label === 'TP' && !suppressed.has(`${f.rule}:${f.file}:${f.line}`))
    if (keptMatch) tpKept++
  } else {
    fpCases++
    if (r.findings.length === 0) { fpClean++; det.genSilent++ } else if (r.findings.every((f) => suppressed.has(`${f.rule}:${f.file}:${f.line}`))) { fpClean++; det.allSuppressed++ } else { det.keptNoise++ }
  }
}

const gcost = gen.reduce((n, r) => n + r.cost, 0)
const pcost = pf.reduce((n, r) => n + (r.cost ?? r.usage?.cost ?? 0), 0)
console.log(`CASE-LEVEL CHAIN (n=${gen.length}):`)
console.log(`  TP-ret   ${tpKept}/${tpCases} = ${(tpKept / tpCases).toFixed(3)}`)
console.log(`  FP-clean ${fpClean}/${fpCases} = ${(fpClean / fpCases).toFixed(3)}  (genSilent ${det.genSilent}, allSuppressed ${det.allSuppressed}, keptNoise ${det.keptNoise})`)
console.log(`  chain cost $${(gcost + pcost).toFixed(2)} (gen $${gcost.toFixed(2)} + filter $${pcost.toFixed(2)})`)
