#!/usr/bin/env node
/**
 * Aggregate Phase A JSONL result files into a metrics table.
 *
 * Usage:
 *   node scripts/bench/summarize-phase-a.mjs [--dir tmp/bench/phaseA] [--by-cwe] [--md]
 */
import fs from 'node:fs'
import path from 'node:path'
import { computeMetrics } from '../../src/triage/metrics.js'

const ROOT = process.cwd()
const dirIdx = process.argv.indexOf('--dir')
const dir = path.join(ROOT, dirIdx >= 0 ? process.argv[dirIdx + 1] : 'tmp/bench/phaseA')
const byCwe = process.argv.includes('--by-cwe')
const asMd = process.argv.includes('--md')

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort()
if (files.length === 0) {
  console.error(`no .jsonl files in ${dir}`)
  process.exit(1)
}

const rows = []
for (const f of files) {
  const results = fs.readFileSync(path.join(dir, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  const metrics = computeMetrics(results)
  rows.push({ file: f.replace(/\.jsonl$/, ''), n: results.length, ...metrics })
}

const pick = (r) => ({
  cond: r.file,
  n: r.n,
  'FP-id F1': r.f1.toFixed(3),
  fpRec: r.fpRecall.toFixed(3),
  fpPrec: r.fpPrecision.toFixed(3),
  'TP-ret': r.tpRetention.toFixed(3),
  'unk%': (r.unknownRate * 100).toFixed(1),
  $: r.totalCost.toFixed(2)
})

const header = Object.keys(pick(rows[0]))
const fmt = asMd
  ? (r) => `| ${Object.values(pick(r)).join(' | ')} |`
  : (r) => Object.values(pick(r)).join('\t')
const sep = asMd ? `|${header.map(() => '---').join('|')}|` : '-'.repeat(110)

console.log(asMd ? `| ${header.join(' | ')} |` : header.join('\t'))
console.log(sep)
for (const r of rows) console.log(fmt(r))

if (byCwe) {
  for (const r of rows) {
    console.log(`\n## ${r.file}`)
    console.log(asMd ? '| cwe | n | fp | tp | fpRec | tpRet |' : ['cwe', 'n', 'fp', 'tp', 'fpRec', 'tpRet'].join('\t'))
    for (const [cwe, s] of Object.entries(r.byCwe)) {
      const line = [cwe, s.n, s.fp, s.tp, (s.fpRecall ?? 0).toFixed(2), (s.tpRetention ?? 0).toFixed(2)].join(asMd ? ' | ' : '\t')
      console.log(asMd ? `| ${line} |` : line)
    }
  }
}
