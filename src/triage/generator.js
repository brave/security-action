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
  'You are a read-only code-review agent that reports violations of the rule(s) given in the task.',
  'Treat your working directory as the repository root. Do NOT modify any files.',
  'Inspect the scoped files with the provided tools before reporting.',
  'Report a finding ONLY for concrete violations grounded in code you actually viewed;',
  'never report speculatively. If the scoped files do not violate any given rule, submit an empty findings list.',
  'This is NOT a triage task. Never return label/confidence/verdict fields.',
  'Submit your final answer through the done tool as JSON:',
  '{"findings": [{"file": "path/relative/to/repo", "line": <number>, "message": "<what is wrong and why it is dangerous>", "rule": "<exact rule name from the task>", "cwe": "CWE-N"}]}',
  'Copy the rule name and CWE exactly from the rule header the task provides; omit cwe only when the rule has none.',
  'Every finding must be inside one of the scoped files and attributed to one specific rule you were given.',
  'As soon as you have inspected the scoped files, call done immediately — do not narrate instead of calling done.'
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
    clean.push({ file: f.file, line: Number(f.line), message: f.message, cwe: f.cwe ?? null, rule: f.rule ?? null })
  }
  return { ok: true, value: { findings: clean } }
}

export function findingToLogLine ({ rule, finding }) {
  const cwe = finding.cwe ?? (rule.cwe?.[0] ?? null)
  const name = finding.rule ?? rule.name
  const meta = `<!-- Category: ${rule.rubric ?? ''}, CWE: ${cwe ?? ''}, Rule: ${name} -->`
  return `F:${finding.file}:${finding.line} ${finding.message} ${meta}`
}

export function formatGenerationTask ({ rule, files }) {
  return [
    `## Rule(s) to apply: ${rule.name}`,
    `(rubric: ${rule.rubric}, severity: ${rule.severity}, cwe: ${rule.cwe?.join(', ') || 'none'})`,
    '',
    rule.body,
    '',
    '## Scoped files (inspect these; report findings only in these files)',
    ...files.map((f) => `- ${f}`),
    '',
    'Inspect the scoped files for violations of the rule(s) above, then call done with {"findings": [...]} (empty array when none apply).'
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
