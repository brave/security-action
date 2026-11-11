import { BudgetExceededError } from '../../openrouterClient.js'
import { parseVerdict, unknownVerdict } from '../verdict.js'

export const DEFAULT_SYSTEM_PROMPT =
  'You are a security-oriented code reviewer triaging a SAST finding in read-only mode. ' +
  'Gather evidence with the provided tools, then return your final verdict through the done tool. ' +
  'Be conservative: label TP only with code-grounded evidence of a plausible exploit path.'

function extractToolCalls (res) {
  const raw = res?.toolCalls ??
    res?.raw?.choices?.[0]?.message?.tool_calls ?? []
  return (Array.isArray(raw) ? raw : []).map((call, i) => {
    if (call?.function) {
      return { id: call.id ?? `call_${i}`, name: call.function.name, arguments: call.function.arguments ?? '{}' }
    }
    return { id: call?.id ?? `call_${i}`, name: call?.name, arguments: call?.arguments ?? '{}' }
  }).filter(call => typeof call.name === 'string')
}

function extractUsage (res, usage) {
  const u = res?.usage ?? {}
  usage.promptTokens += u.prompt_tokens ?? u.promptTokens ?? 0
  usage.completionTokens += u.completion_tokens ?? u.completionTokens ?? 0
  usage.cost += u.cost ?? u.costUsd ?? 0
}

function pushAssistant (messages, res, calls) {
  messages.push({
    role: 'assistant',
    content: res?.content ?? null,
    tool_calls: calls.map((call, i) => ({
      id: call.id ?? `call_${i}`,
      type: 'function',
      function: { name: call.name, arguments: call.arguments }
    }))
  })
}

/**
 * Multi-turn tool-calling triage loop for a single SAST finding.
 * chat: async fn({model, messages}) -> {content, finishReason, usage, raw?}
 * tools: registry from createToolRegistry (run(name, args), names(), schema()).
 * When a registry is present its function schemas are forwarded on every
 * chat request so the model can discover the tools.
 * Returns {verdict, stopped: done|max_turns|error|budget, turns, toolCalls, usage, messages}.
 */
export async function runAgent ({
  chat,
  model,
  task,
  caseId,
  agent = 'triage-agent',
  tools,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  maxTurns = 16,
  parseFinal = null
}) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: task }
  ]
  const usage = { promptTokens: 0, completionTokens: 0, cost: 0 }
  let turns = 0
  let toolCallCount = 0
  let stopped = null
  let verdict = null

  const finish = (stop, v) => ({
    verdict: v,
    stopped: stop,
    turns,
    toolCalls: toolCallCount,
    usage,
    messages
  })

  while (stopped === null) {
    if (turns >= maxTurns) {
      stopped = 'max_turns'
      verdict = unknownVerdict({ caseId, agent, reason: 'max turns reached without a verdict' })
      return finish(stopped, verdict)
    }

    let res
    try {
      res = await chat({ model, messages, tools: tools ? tools.schema() : undefined })
    } catch (err) {
      if (err instanceof BudgetExceededError) {
        stopped = 'budget'
        verdict = unknownVerdict({ caseId, agent, reason: `budget exhausted: ${err.message}` })
      } else {
        stopped = 'error'
        verdict = unknownVerdict({ caseId, agent, reason: `agent error: ${err.message}` })
      }
      return finish(stopped, verdict)
    }

    turns++
    extractUsage(res, usage)
    const calls = extractToolCalls(res)
    pushAssistant(messages, res, calls)

    if (calls.length === 0) {
      // No tool call: try to interpret the content itself as the final result.
      const parsed = parseFinal
        ? parseFinal(res?.content, { caseId, agent })
        : parseVerdict(res?.content, { caseId, agent })
      if (parsed.ok) {
        stopped = 'done'
        return finish('done', parsed.value ?? parsed.verdict)
      }
      messages.push({ role: 'user', content: 'Return your final result through the done tool as valid JSON.' })
      continue
    }

    for (const call of calls) {
      if (call.name === 'done') {
        let args
        try {
          args = JSON.parse(call.arguments)
        } catch {
          args = call.arguments
        }
        const parsed = parseFinal
          ? parseFinal(args, { caseId, agent })
          : parseVerdict(args, { caseId, agent })
        if (parsed.ok) {
          stopped = 'done'
          return finish('done', parsed.value ?? parsed.verdict)
        }
        messages.push({ role: 'tool', tool_call_id: call.id, name: 'done', content: `Invalid result: ${parsed.error}` })
        continue
      }

      toolCallCount++
      let toolArgs
      try {
        toolArgs = JSON.parse(call.arguments)
      } catch {
        toolArgs = {}
      }
      const result = tools
        ? await tools.run(call.name, toolArgs)
        : { ok: false, error: `Unknown tool: ${call.name}` }
      const content = result.ok ? result.output : `Tool error: ${result.error}`
      messages.push({ role: 'tool', tool_call_id: call.id, name: call.name, content })
    }
  }

  return finish(stopped, verdict)
}
