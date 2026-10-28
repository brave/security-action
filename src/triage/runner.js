import fs from 'node:fs'
import { formatTask } from './task.js'
import { runAgent } from './harness/agent.js'
import { createToolRegistry } from './harness/tools.js'
import { parseVerdict, unknownVerdict } from './verdict.js'

/**
 * Execute a benchmark queue against one model, either agentic (multi-turn
 * tool-calling) or vanilla (single direct call), and collect labeled result
 * rows. Results are appended to outPath as JSONL (one per queue item, in
 * queue order) so partial progress survives interruption.
 *
 * makeFsi(repoRoot) -> { readFileSync, readdirSync } for the tool registry.
 * In production this wraps node:fs; tests inject fakes.
 */
export async function runBenchmark ({
  queue,
  chat,
  model,
  mode = 'agentic',
  maxTurns = 16,
  budgetUsd = Infinity,
  initialSpendUsd = 0,
  makeFsi = null,
  agent = 'swe-agent',
  outPath = null,
  onResult = null
}) {
  let spend = initialSpendUsd
  const results = []

  for (const item of queue.items) {
    const fsi = makeFsi ? makeFsi(item.repoRoot) : null

    let outcome
    if (spend >= budgetUsd) {
      outcome = {
        verdict: unknownVerdict({ caseId: item.caseId, agent, reason: 'budget exhausted: session budget reached before this item' }),
        stopped: 'budget',
        turns: 0,
        toolCalls: 0,
        usage: { promptTokens: 0, completionTokens: 0, cost: 0 }
      }
    } else if (mode === 'vanilla') {
      outcome = await runVanilla({ chat, model, item, agent, caseId: item.caseId })
    } else {
      const tools = createToolRegistry({ root: item.repoRoot, fsi })
      const task = formatTask({
        caseJson: item.caseJson,
        repoRoot: item.repoRoot,
        readFile: fsi ? fsi.readFileSync : () => { throw new Error('no fs') },
        agent
      })
      outcome = await runAgent({
        chat, model, task, caseId: item.caseId, agent, tools, maxTurns
      })
    }

    spend += outcome.usage?.cost ?? 0
    const row = {
      caseId: item.caseId,
      dataset: item.dataset,
      label: item.label,
      cwe: item.cwe,
      verdict: outcome.verdict,
      stopped: outcome.stopped,
      turns: outcome.turns,
      toolCalls: outcome.toolCalls,
      usage: outcome.usage
    }
    results.push(row)
    if (onResult) onResult(row)
    if (outPath) fs.appendFileSync(outPath, `${JSON.stringify(row)}\n`)
  }

  return { results, totalSpendUsd: spend }
}

async function runVanilla ({ chat, model, item, agent, caseId }) {
  const task = formatTask({ caseJson: item.caseJson, repoRoot: item.repoRoot, readFile: () => { throw new Error('no fs') }, agent: 'llm' })
  const usage = { promptTokens: 0, completionTokens: 0, cost: 0 }
  try {
    const res = await chat({ model, messages: [{ role: 'user', content: task }] })
    usage.promptTokens = res.usage?.prompt_tokens ?? res.usage?.promptTokens ?? 0
    usage.completionTokens = res.usage?.completion_tokens ?? res.usage?.completionTokens ?? 0
    usage.cost = res.usage?.cost ?? res.usage?.costUsd ?? 0
    const parsed = parseVerdict(res.content, { caseId, agent })
    if (parsed.ok) return { verdict: parsed.verdict, stopped: 'done', turns: 1, toolCalls: 0, usage }
    return {
      verdict: unknownVerdict({ caseId, agent, reason: `invalid verdict: ${parsed.error}` }),
      stopped: 'error',
      turns: 1,
      toolCalls: 0,
      usage
    }
  } catch (err) {
    return {
      verdict: unknownVerdict({ caseId, agent, reason: `agent error: ${err.message}` }),
      stopped: 'error',
      turns: 0,
      toolCalls: 0,
      usage
    }
  }
}
