#!/usr/bin/env node
/**
 * Phase A model bake-off runner.
 *
 * Executes the benchmark queue (paper artifact datasets) against one or more
 * OpenRouter models under vanilla and/or agentic conditions, writing one
 * JSONL results file per condition and printing a metrics summary.
 *
 * Usage:
 *   node scripts/bench/run-phase-a.mjs \
 *     --models z-ai/glm-5.3-flash \
 *     --modes agentic,vanilla \
 *     --sample-fp 150 --sample-tp 150 --seed 42 \
 *     --budget 5 --out tmp/bench/phaseA
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')

function parseArgs (argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      if (a.includes('=')) args[key] = a.slice(a.indexOf('=') + 1)
      else { args[key] = argv[i + 1]; i++ }
    } else args._.push(a)
  }
  return args
}

function loadEnv () {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

const DEFAULTS = {
  owaspFpDir: 'tmp/paper-artifact/data/artifact-data/shared/owasp_fp/triage-owasp-benchmark',
  owaspTpDir: 'tmp/paper-artifact/data/artifact-data/shared/owasp_tp/triage-owasp-benchmark-tp',
  owaspRepoRoot: 'tmp/paper-artifact/BenchmarkJava',
  owaspExpectedResultsCsv: 'tmp/paper-artifact/BenchmarkJava/expectedresults-1.2.csv',
  vul4jCaseDir: 'tmp/paper-artifact/data/artifact-data/shared/vul4j/triage-vul4j-alerts',
  vul4jManifestPath: 'tmp/paper-artifact/data/artifact-data/shared/vul4j/triage-vul4j-alerts_meta/manifest.json',
  vul4jCheckoutRoot: 'tmp/vul4j-repos',
  vul4jDatasetCsv: 'tmp/paper-artifact/data/artifact-data/shared/vul4j/vul4j_dataset.csv',
  ossfuzzTaskDir: 'tmp/paper-artifact/data/artifact-data/shared/ossfuzz/batches/current_pool/tasks/rerun/triage-oss-fuzz-agent',
  ossfuzzLabelsPath: 'tmp/paper-artifact/data/artifact-data/shared/ossfuzz/batches/current_pool/judging/pool_labelling.jsonl',
  ossfuzzSnapshotDir: 'tmp/paper-artifact/data/artifact-data/shared/ossfuzz/batches/current_pool/snapshots/buggy'
}

const existsDir = (p) => p && fs.existsSync(p) && fs.statSync(p).isDirectory()

async function main () {
  const args = parseArgs(process.argv.slice(2))
  loadEnv()
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) { console.error('OPENROUTER_API_KEY missing (.env)'); process.exit(1) }

  const models = (args.models ?? 'z-ai/glm-5.3-flash').split(',')
  const modes = (args.modes ?? 'agentic,vanilla').split(',')
  const sampleFp = Number(args['sample-fp'] ?? 150)
  const sampleTp = Number(args['sample-tp'] ?? 150)
  const seed = Number(args.seed ?? 42)
  const budgetUsd = Number(args.budget ?? 5)
  const maxTurns = Number(args['max-turns'] ?? 16)
  const maxTokens = Number(args['max-tokens'] ?? 8192)
  const temperature = args.temperature !== undefined ? Number(args.temperature) : 0
  const limit = Number(args.limit ?? 0)
  const outDir = path.join(ROOT, args.out ?? 'tmp/bench/phaseA')

  const datasets = (args.datasets ?? 'owasp,vul4j,ossfuzz').split(',').filter(Boolean)
  const rel = (p) => path.join(ROOT, p)
  const queueArgs = {}
  if (datasets.includes('owasp')) {
    for (const [k, v] of Object.entries(DEFAULTS)) if (k.startsWith('owasp') && v) queueArgs[k] = rel(v)
  }
  if (datasets.includes('vul4j') && existsDir(rel(DEFAULTS.vul4jCaseDir))) {
    for (const [k, v] of Object.entries(DEFAULTS)) if (k.startsWith('vul4j')) queueArgs[k] = rel(v)
  } else if (datasets.includes('vul4j')) console.warn('vul4j skipped: checkouts not prepared (scripts/bench/prepare-vul4j.sh)')
  if (datasets.includes('ossfuzz') && existsDir(rel(DEFAULTS.ossfuzzTaskDir))) {
    for (const [k, v] of Object.entries(DEFAULTS)) if (k.startsWith('ossfuzz')) queueArgs[k] = rel(v)
  } else if (datasets.includes('ossfuzz')) console.warn('ossfuzz skipped: task dir missing')

  const { createOpenRouterClient } = await import(path.join(ROOT, 'src/openrouterClient.js'))
  const { buildQueue } = await import(path.join(ROOT, 'src/triage/queue.js'))
  const { runBenchmark } = await import(path.join(ROOT, 'src/triage/runner.js'))
  const { computeMetrics } = await import(path.join(ROOT, 'src/triage/metrics.js'))

  const client = createOpenRouterClient({ apiKey, budgetUsd, sleep: (ms) => new Promise((_resolve) => setTimeout(_resolve, ms)) })
  const reasoningEffort = args['reasoning-effort']
  const reasoning = !reasoningEffort
    ? undefined
    : (reasoningEffort === 'off' ? { enabled: false } : { effort: reasoningEffort })
  const chat = ({ model, messages }) => client.chat({
    model,
    messages,
    maxTokens,
    temperature,
    ...(reasoning ? { reasoning } : {})
  })
  const makeFsi = (repoRoot) => ({
    readFileSync: (p) => fs.readFileSync(p, 'utf8'),
    readdirSync: (dir) => fs.readdirSync(dir)
  })

  fs.mkdirSync(outDir, { recursive: true })
  const queue = buildQueue({
    ...queueArgs,
    sampleFp,
    sampleTp,
    seed,
    listDir: (dir) => fs.readdirSync(dir),
    readFile: (f) => fs.readFileSync(f, 'utf8')
  })
  const items = limit > 0 ? queue.items.slice(0, limit) : queue.items
  console.log(`queue: ${items.length} items (fp ${sampleFp}/tp ${sampleTp}, seed ${seed}, datasets ${datasets.join('+')})${queue.skipped.length ? `, skipped ${queue.skipped.length}` : ''}`)

  for (const model of models) {
    for (const mode of modes) {
      const outFile = path.join(outDir, `${model.replace(/\//g, '__')}-${mode}.jsonl`)
      let pending = items
      let priorRows = []
      if (fs.existsSync(outFile)) {
        priorRows = fs.readFileSync(outFile, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
        const completed = new Set(priorRows.filter(r => r.stopped === 'done' && r.verdict.label !== 'UNKNOWN').map(r => r.caseId))
        pending = items.filter(i => !completed.has(i.caseId))
        console.warn(`resume ${model} ${mode}: ${completed.size} done rows cached, ${pending.length} pending`)
        if (pending.length === 0) {
          console.warn(`skip ${model} ${mode}: nothing pending`)
          continue
        }
      }
      console.log(`\n=== ${model} [${mode}] → ${path.relative(ROOT, outFile)}`)
      const before = client.totalSpendUsd
      const t0 = Date.now()
      const { results, totalSpendUsd } = await runBenchmark({
        queue: { items: pending },
        chat,
        model,
        mode,
        maxTurns,
        budgetUsd,
        initialSpendUsd: client.totalSpendUsd,
        makeFsi,
        agent: mode === 'agentic' ? 'swe-agent' : 'llm',
        outPath: outFile
      })
      const byCase = new Map(priorRows.map(r => [r.caseId, r]))
      for (const r of results) byCase.set(r.caseId, r)
      const allRows = [...byCase.values()]
      const m = computeMetrics(allRows)
      const cost = totalSpendUsd - before
      console.log(`n=${allRows.length} (${results.length} new) F1=${m.f1.toFixed(3)} fpRecall=${m.fpRecall.toFixed(3)} fpPrecision=${m.fpPrecision.toFixed(3)} tpRetention=${m.tpRetention.toFixed(3)} unknown=${m.unknownRate.toFixed(3)} cost=$${cost.toFixed(4)} ${(Date.now() - t0) / 1000}s`)
      const stopped = {}
      for (const r of results) stopped[r.stopped] = (stopped[r.stopped] ?? 0) + 1
      console.log(`stopped: ${JSON.stringify(stopped)} session total $${client.totalSpendUsd.toFixed(4)}`)
    }
  }
  console.log(`\ndone: session spend $${client.totalSpendUsd.toFixed(4)} / budget $${budgetUsd}`)
}

main().catch(err => { console.error(err); process.exit(1) })
