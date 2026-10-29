/**
 * LLM findings generation driven by the chromium knowledge-base rules.
 *
 * For every (rule, scoped files) pair a read-only agent inspects the code and
 * reports violations through the done tool as {"findings": [...]}.
 * Findings are rendered as reviewdog enriched log lines
 * (`F:<file>:<line> <message> <!-- Category: <rubric>, CWE: CWE-N, Rule:
 * <name> -->`) so the existing triage chain (logLinesToQueue -> runner ->
 * logFilter) consumes them unchanged.
 */
import { runAgent } from './harness/agent.js'
import { stableCaseId } from './verdict.js'

export const GENERATOR_SYSTEM_PROMPT = [
  'You are a read-only code-review agent that reports violations of a single rule.',
  'Treat your working directory as the repository root. Do NOT modify any files.',
  'Inspect the scoped files with the provided tools before reporting.',
  'Report a finding ONLY for concrete violations grounded in code you actually viewed;',
  'never report speculatively. If the scoped files do not violate the rule, submit an empty findings list.',
  'Submit your final answer through the done tool as JSON:',
  '{"findings": [{"file": "path/relative/to/repo", "line": <number>, "message": "<what is wrong and why it is dangerous>"}]}',
  'Use the CWE from the rule when available; omit the cwe field otherwise.',
  'Every finding must be inside one of the scoped files.'
].join('\n')

export function parseFindings (args) {
  let obj = args
  if (typeof args === 'string') {
    try {
      obj = JSON.parse(args)
    } catch {
      return { ok: false, error: 'final result is not valid JSON' }
    }
  }
  const findings = obj?.findings
  if (!Array.isArray(findings)) return { ok: false, error: 'missing findings array' }
  const clean = []
  for (const f of findings) {
    if (!f || typeof f.file !== 'string' || !Number.isFinite(Number(f.line)) || typeof f.message !== 'string') {
      return { ok: false, error: `malformed finding: ${JSON.stringify(f)}` }
    }
    clean.push({ file: f.file, line: Number(f.line), message: f.message, cwe: f.cwe ?? null })
  }
  return { ok: true, value: { findings: clean } }
}

export function findingToLogLine ({ rule, finding }) {
  const cwe = finding.cwe ?? (rule.cwe?.[0] ?? null)
  const meta = `<!-- Category: ${rule.rubric ?? ''}, CWE: ${cwe ?? ''}, Rule: ${rule.name} -->`
  return `F:${finding.file}:${finding.line} ${finding.message} ${meta}`
}

export function formatGenerationTask ({ rule, files }) {
  return [
    `## Rule: ${rule.name}`,
    `(rubric: ${rule.rubric}, severity: ${rule.severity}, cwe: ${rule.cwe?.join(', ') || 'none'})`,
    '',
    rule.body,
    '',
    '## Scoped files (inspect these; report findings only in these files)',
    ...files.map((f) => `- ${f}`),
    '',
    'Inspect the scoped files for violations of the rule above. Then call done with your findings JSON.'
  ].join('\n')
}

/**
 * Run the generation agent for one scoped rule. Returns
 * { findings, logLines, stopped, turns, toolCalls, usage }.
 */
export async function generateForRule ({
  chat,
  model,
  rule,
  files,
  tools,
  maxTurns = 16
}) {
  const run = await runAgent({
    chat,
    model,
    task: formatGenerationTask({ rule, files }),
    caseId: stableCaseId({ case_id: `${rule.name}:${files.join('|')}` }),
    agent: 'findings-agent',
    tools,
    systemPrompt: GENERATOR_SYSTEM_PROMPT,
    maxTurns,
    parseFinal: parseFindings
  })
  const findings = run.verdict?.findings ?? []
  return {
    findings,
    logLines: findings.map((f) => findingToLogLine({ rule, finding: f })),
    stopped: run.stopped,
    turns: run.turns,
    toolCalls: run.toolCalls,
    usage: run.usage
  }
}
