#!/usr/bin/env node
/**
 * Triage filter: applies agentic FP-triage verdicts to a reviewdog log
 * before the findings are posted to the PR.
 *
 * Findings are parsed straight from the log lines (each finding carries
 * its CWE and rule id inside the Category comment the runner template
 * embeds), so no side-channel capture file is needed and every runner
 * flows through the same pipeline.
 *
 * Fail-open by design: any error (disabled config, model failure, budget
 * exhaustion) leaves the log untouched and exits 0 so the scan pipeline
 * is never broken by the triage stage.
 *
 * Usage:
 *   node scripts/triage-filter.mjs --runner opengrep \
 *     --log opengrep.log \
 *     --config "$RUNNER_TEMP/security-action/triage-config.json" \
 *     [--workspace /tmp/ws] [--mock-chat /tmp/ws/mock-chat.json] [--out opengrep.log]
 *
 * Config: { enabled, model, budgetUsd, maxFindings, allowCwes? }
 * Summary JSON on stdout: { triaged, suppressed, annotated, cost, model }
 */
import fs from 'node:fs'
import { logLinesToQueue } from '../src/triage/findingsQueue.js'
import { policyDecision, DEFAULT_SUPPRESS_CWES } from '../src/triage/policy.js'
import { applyTriageToLog } from '../src/triage/logFilter.js'
import { runBenchmark } from '../src/triage/runner.js'

function parseArgs (argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      args[key] = argv[i + 1]
      i++
    }
  }
  return args
}

function passthrough ({ logPath, outPath, reason }) {
  if (outPath !== logPath && fs.existsSync(logPath)) fs.copyFileSync(logPath, outPath)
  process.stdout.write(JSON.stringify({ triaged: 0, suppressed: 0, annotated: 0, cost: 0, model: null, passthrough: reason }))
}

async function main () {
  const args = parseArgs(process.argv.slice(2))
  const workspace = args.workspace ?? process.cwd()
  const outPath = args.out ?? args.log
  const logPath = args.log

  let config
  try {
    config = JSON.parse(fs.readFileSync(args.config, 'utf8'))
  } catch {
    return passthrough({ logPath, outPath, reason: 'no config' })
  }
  if (!config?.enabled) return passthrough({ logPath, outPath, reason: 'disabled' })

  const logLines = fs.readFileSync(logPath, 'utf8').split('\n').filter((l) => l !== '')
  const { items } = logLinesToQueue(logLines, { repoRoot: workspace, runner: args.runner ?? 'opengrep' })
  const capped = items.slice(0, config.maxFindings ?? 300)
  if (capped.length === 0) return passthrough({ logPath, outPath, reason: 'no findings' })

  let chat
  if (args['mock-chat']) {
    const responses = JSON.parse(fs.readFileSync(args['mock-chat'], 'utf8'))
    let i = 0
    chat = async () => {
      const res = responses[i++ % responses.length]
      if (res.label) {
        // bare verdict fixture: wrap as a done tool call the agent loop accepts
        return {
          content: null,
          finishReason: 'tool_calls',
          usage: { prompt_tokens: 10, completion_tokens: 10, cost: 0 },
          toolCalls: [{ id: `mock${i}`, name: 'done', arguments: JSON.stringify(res) }]
        }
      }
      return res
    }
  } else {
    const { createOpenRouterClient } = await import('../src/openrouterClient.js')
    const apiKey = config.apiKey ?? process.env.OPENROUTER_API_KEY
    if (!apiKey) return passthrough({ logPath, outPath, reason: 'no api key' })
    const client = createOpenRouterClient({ apiKey, budgetUsd: config.budgetUsd ?? 1 })
    chat = ({ model, messages, tools }) => client.chat({ model, messages, tools, maxTokens: 8192, reasoning: { effort: 'low' } })
  }

  const makeFsi = (repoRoot) => ({
    readFileSync: (p) => fs.readFileSync(p, 'utf8'),
    readdirSync: (d) => fs.readdirSync(d)
  })

  let exec = null
  if (args['mock-exec']) {
    const outputs = JSON.parse(fs.readFileSync(args['mock-exec'], 'utf8'))
    let j = 0
    exec = async () => outputs[j++ % outputs.length]
  } else {
    const { createExecTool } = await import('../src/triage/execTool.js')
    const { mkdtempSync } = await import('node:fs')
    const { tmpdir } = await import('node:os')
    const pathMod = await import('node:path')
    const actionPath = pathMod.resolve(new URL('.', import.meta.url).pathname, '..')
    exec = createExecTool({
      repoRoot: workspace,
      actionPath,
      scratchDir: mkdtempSync(pathMod.join(tmpdir(), 'triage-exec-')),
      timeoutMs: 30000
    })
  }

  const { results, totalSpendUsd } = await runBenchmark({
    queue: { items: capped },
    chat,
    model: config.model,
    mode: 'agentic',
    maxTurns: 16,
    budgetUsd: config.budgetUsd ?? 1,
    makeFsi,
    exec,
    agent: 'swe-agent'
  })

  const byId = new Map(capped.map((i) => [i.caseId, i]))
  const rows = results.map((r) => {
    const item = byId.get(r.caseId)
    return { ...r, file: item?.file, line: item?.line, decision: policyDecision(r.verdict, { cwe: r.cwe, allowCwes: config.allowCwes ?? DEFAULT_SUPPRESS_CWES }) }
  })
  const filtered = applyTriageToLog(fs.readFileSync(logPath, 'utf8').split('\n').filter((l) => l !== ''), rows)
  fs.writeFileSync(outPath, `${filtered.lines.join('\n')}\n`)

  const suppressed = filtered.suppressedCount
  process.stdout.write(JSON.stringify({
    triaged: rows.length,
    suppressed,
    annotated: filtered.annotatedCount,
    cost: totalSpendUsd,
    model: config.model
  }))
}

main().catch((err) => {
  process.stderr.write(`triage-filter: fail-open (${err.message})\n`)
  const args = parseArgs(process.argv.slice(2))
  try {
    passthrough({ logPath: args.log, outPath: args.out ?? args.log, reason: `error: ${err.message}` })
  } catch {
    // last resort: leave the log as-is
  }
  process.exit(0)
})
