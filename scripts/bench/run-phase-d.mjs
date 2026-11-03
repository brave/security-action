#!/usr/bin/env node
/**
 * Phase D: LLM findings-generation benchmark (vs opengrep).
 *
 * Leg 1 (generation): for each sampled OWASP case the KB rules scoped to the
 * case file run through generateForRule (chunked), producing findings which
 * are labeled against the case oracle: a finding whose CWE matches the
 * expected CWE inherits the case label (TP/FP); everything else is noise (FP).
 *
 * Leg 2 (--postfilter): the generated findings become queue items and run
 * through the same triage benchmark runner as Phase A; metrics measure how
 * much generated noise the post-filter suppresses and how many true findings
 * it keeps.
 *
 * Usage:
 *   node scripts/bench/run-phase-d.mjs \
 *     --models z-ai/glm-5.3-flash \
 *     --sample-fp 100 --sample-tp 100 --seed 42 \
 *     --budget 8 --chunk 12 --max-chunks 12 \
 *     [--postfilter --exec --websearch] --out tmp/bench/phaseD
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
      else if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) args[key] = true
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
  kbRoot: 'assets/knowledge_base'
}

const rel = (p) => path.join(ROOT, p)

async function main () {
  const args = parseArgs(process.argv.slice(2))
  loadEnv()
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) { console.error('OPENROUTER_API_KEY missing (.env)'); process.exit(1) }

  const models = (args.models ?? 'z-ai/glm-5.3-flash').split(',')
  const sampleFp = Number(args['sample-fp'] ?? 100)
  const sampleTp = Number(args['sample-tp'] ?? 100)
  const seed = Number(args.seed ?? 42)
  const budgetUsd = Number(args.budget ?? 8)
  const chunkSize = Number(args.chunk ?? 12)
  const maxChunks = Number(args['max-chunks'] ?? 12)
  const maxTokens = Number(args['max-tokens'] ?? 8192)
  const maxTurns = Number(args['max-turns'] ?? 8)
  const reasoningEffort = args['reasoning-effort']
  const outDir = path.join(ROOT, args.out ?? 'tmp/bench/phaseD')
  fs.mkdirSync(outDir, { recursive: true })

  const { createOpenRouterClient } = await import(path.join(ROOT, 'src/openrouterClient.js'))
  const { buildQueue } = await import(path.join(ROOT, 'src/triage/queue.js'))
  const { loadKb, scopeRules } = await import(path.join(ROOT, 'src/triage/kb.js'))
  const { generateForRule, findingToLogLine } = await import(path.join(ROOT, 'src/triage/generator.js'))
  const { createToolRegistry } = await import(path.join(ROOT, 'src/triage/harness/tools.js'))
  const client = createOpenRouterClient({ apiKey, budgetUsd, sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)) })
  const reasoning = !reasoningEffort
    ? undefined
    : (reasoningEffort === 'off' ? { enabled: false } : { effort: reasoningEffort })
  const chat = ({ model, messages, tools }) => client.chat({
    model,
    messages,
    tools,
    maxTokens,
    temperature: 0,
    signal: AbortSignal.timeout(15 * 60 * 1000),
    ...(reasoning ? { reasoning } : {})
  })

  const fsi = { readFileSync: (p) => fs.readFileSync(p, 'utf8'), readdirSync: (d) => fs.readdirSync(d) }
  const kbRules = loadKb({ root: rel(DEFAULTS.kbRoot), fsi })
  console.log(`kb: ${kbRules.length} rules`)

  let makeExec = null
  if (args.exec) {
    const { createExecTool } = await import(path.join(ROOT, 'src/triage/execTool.js'))
    const os = await import('node:os')
    makeExec = (item) => createExecTool({
      repoRoot: item.repoRoot,
      actionPath: path.resolve(ROOT, '.'),
      scratchDir: fs.mkdtempSync(path.join(os.tmpdir(), 'bench-exec-')),
      timeoutMs: 30000
    })
    console.log('exec tool on (landrun sandbox, no network)')
  }
  let websearch = null
  if (args.websearch) {
    const braveKey = process.env.BRAVE_API_KEY
    if (!braveKey) { console.error('BRAVE_API_KEY missing (env or .env)'); process.exit(1) }
    const { createBraveSearch } = await import(path.join(ROOT, 'src/triage/harness/braveSearch.js'))
    websearch = createBraveSearch({ apiKey: braveKey }).search
    console.log('websearch tool on (Brave API)')
  }

  if (args['postfilter-only']) {
    if (!args['gen-file']) { console.error('usage: --postfilter-only --gen-file <gen.jsonl>'); process.exit(1) }
    const genRows = fs.readFileSync(path.resolve(ROOT, args['gen-file']), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
    for (const model of models) {
      await postfilter(args, genRows, model, { chat, client, budgetUsd, outDir, repoRoot: rel(DEFAULTS.owaspRepoRoot), makeExec, websearch })
    }
    return
  }

  const queue = buildQueue({
    owaspFpDir: rel(DEFAULTS.owaspFpDir),
    owaspTpDir: rel(DEFAULTS.owaspTpDir),
    owaspRepoRoot: rel(DEFAULTS.owaspRepoRoot),
    owaspExpectedResultsCsv: rel(DEFAULTS.owaspExpectedResultsCsv),
    sampleFp,
    sampleTp,
    seed,
    listDir: (dir) => fs.readdirSync(dir),
    readFile: (f) => fs.readFileSync(f, 'utf8')
  })
  console.log(`queue: ${queue.items.length} owasp cases (fp ${sampleFp}/tp ${sampleTp}, seed ${seed})`)

  const repoRoot = rel(DEFAULTS.owaspRepoRoot)
  const registry = createToolRegistry({ root: repoRoot, fsi, exec: null })

  for (const model of models) {
    const outFile = path.join(outDir, `${model.replace(/\//g, '__')}-gen.jsonl`)
    let priorRows = []
    if (fs.existsSync(outFile)) {
      priorRows = fs.readFileSync(outFile, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
    }
    const doneIds = new Set(priorRows.filter((r) => Array.isArray(r.findings)).map((r) => r.caseId))
    const pending = queue.items.filter((i) => !doneIds.has(i.caseId))
    console.log(`\n=== generation ${model} → ${path.relative(ROOT, outFile)} (${pending.length} pending)`)
    const rows = [...priorRows]
    for (const item of pending) {
      const file = item.caseJson.file
      const scoped = scopeRules({ rules: kbRules, changedFiles: [file] })
      // cwe-tagged security rules first, then the rest
      scoped.sort((a, b) => (b.rule.cwe.length > 0) - (a.rule.cwe.length > 0))
      const chunks = []
      for (let i = 0; i < scoped.length && chunks.length < maxChunks; i += chunkSize) {
        chunks.push(scoped.slice(i, i + chunkSize))
      }
      const findings = []
      const usage = { promptTokens: 0, completionTokens: 0, cost: 0 }
      let stopped = null
      const t0 = Date.now()
      for (const chunk of chunks) {
        const pseudo = {
          name: chunk[0].rule.name,
          rubric: chunk[0].rule.rubric,
          severity: chunk[0].rule.severity,
          cwe: [...new Set(chunk.flatMap(({ rule }) => rule.cwe))],
          body: chunk.map(({ rule }) => `### ${rule.name}\n\n${rule.body}`).join('\n\n---\n\n')
        }
        const byName = new Map(chunk.map(({ rule }) => [rule.name, rule]))
        let res
        try {
          res = await generateForRule({ chat, model, rule: pseudo, files: [file], tools: registry, maxTurns })
        } catch (err) {
          console.warn(`gen error ${item.caseId} chunk ${chunk[0].rule.name}: ${err.message}`)
          stopped = stopped ?? 'error'
          continue
        }
        for (const f of res.findings) {
          const rule = byName.get(f.rule) ?? chunk[0].rule
          findings.push({
            ...f,
            rule: rule.name,
            logLine: findingToLogLine({ rule, finding: { ...f, rule: rule.name } })
          })
        }
        usage.promptTokens += res.usage.promptTokens
        usage.completionTokens += res.usage.completionTokens
        usage.cost += res.usage.cost
        if (res.stopped === 'error' || res.stopped === 'budget') stopped = res.stopped
      }
      const ms = Date.now() - t0
      const expectedCwe = item.cwe != null ? String(item.cwe) : null
      for (const f of findings) {
        const m = /CWE-(\d+)/.exec(String(f.cwe ?? ''))
        f.cweNum = m ? m[1] : null
        f.label = expectedCwe && f.cweNum === expectedCwe ? item.label : 'FP'
      }
      const row = {
        caseId: item.caseId,
        dataset: item.dataset,
        label: item.label,
        expectedCwe,
        file,
        findings,
        chunksRun: chunks.length,
        chunksTotal: Math.ceil(scoped.length / chunkSize),
        stopped: stopped ?? 'done',
        usage,
        ms,
        cost: usage.cost
      }
      rows.push(row)
      fs.appendFileSync(outFile, JSON.stringify(row) + '\n')
      process.stdout.write(`  ${rows.length - priorRows.length}/${pending.length} ${item.caseId} findings=${findings.length} cost=$${usage.cost.toFixed(4)} ${ms}ms\n`)
    }
    summarize(rows, model)
    if (args.postfilter) await postfilter(args, rows, model, { chat, client, budgetUsd, outDir, repoRoot, makeExec, websearch })
  }
}

function summarize (rows, model) {
  const tpCases = rows.filter((r) => r.label === 'TP')
  const fpCases = rows.filter((r) => r.label === 'FP')
  const tpHit = tpCases.filter((r) => r.findings.some((f) => f.label === 'TP')).length
  const fpHit = fpCases.filter((r) => r.findings.some((f) => f.label === 'FP' && f.cweNum === r.expectedCwe)).length
  const noise = rows.reduce((n, r) => n + r.findings.filter((f) => f.label === 'FP' && f.cweNum !== r.expectedCwe).length, 0)
  const cost = rows.reduce((n, r) => n + r.cost, 0)
  const ms = rows.reduce((n, r) => n + r.ms, 0)
  console.log(`\nGENERATION ${model}: cases=${rows.length} tp ${tpHit}/${tpCases.length} found vuln; fp ${fpHit}/${fpCases.length} triggered; noise findings=${noise}; cost=$${cost.toFixed(2)}; avg ${(ms / Math.max(rows.length, 1) / 1000).toFixed(1)}s/case`)
}

async function postfilter (args, genRows, model, ctx) {
  const { runBenchmark } = await import(path.join(ROOT, 'src/triage/runner.js'))
  const { computeMetrics } = await import(path.join(ROOT, 'src/triage/metrics.js'))
  const { logLinesToQueue } = await import(path.join(ROOT, 'src/triage/findingsQueue.js'))
  const suffix = `${args.exec ? '-exec' : ''}${args.websearch ? '-websearch' : ''}`
  const outFile = path.join(ctx.outDir, `${model.replace(/\//g, '__')}-postfilter${suffix}.jsonl`)

  // findings that need triage: every generated finding, labeled against the oracle
  const lines = []
  const labelBy = new Map()
  const seen = new Set()
  for (const r of genRows) {
    for (const f of r.findings) {
      const key = `${f.file}:${f.line}`
      if (seen.has(key)) continue
      seen.add(key)
      lines.push(f.logLine)
      labelBy.set(key, { label: f.label, cweNum: f.cweNum })
    }
  }
  const { items } = logLinesToQueue(lines, { repoRoot: ctx.repoRoot })
  for (const it of items) {
    const meta = labelBy.get(`${it.file}:${it.line}`) ?? {}
    it.label = meta.label ?? 'FP'
    it.cwe = meta.cweNum ?? null
  }
  console.log(`\n=== postfilter ${model}: ${items.length} findings (tp ${items.filter((i) => i.label === 'TP').length})`)
  const t0 = Date.now()
  const { results } = await runBenchmark({
    queue: { items },
    chat: ctx.chat,
    model,
    mode: 'agentic',
    maxTurns: 16,
    budgetUsd: ctx.budgetUsd,
    initialSpendUsd: ctx.client.totalSpendUsd,
    makeFsi: (root) => ({ readFileSync: (p) => fs.readFileSync(p, 'utf8'), readdirSync: (d) => fs.readdirSync(d) }),
    makeReach: null,
    makeExec: args.exec ? ctx.makeExec : null,
    websearch: ctx.websearch,
    agent: 'swe-agent',
    outPath: outFile
  })
  const metrics = computeMetrics(results)
  console.log(`postfilter ${model}: ${JSON.stringify(metrics)} wall=${((Date.now() - t0) / 1000).toFixed(0)}s → ${path.relative(ROOT, outFile)}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
