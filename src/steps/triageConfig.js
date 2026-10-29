import fs from 'node:fs'

/**
 * Write the triage filter config consumed by assets/reviewdog/triage-filter.sh.
 * The filter runs inside reviewdog.sh between the local scan and posting,
 * so options flow through a file rather than the action scope.
 *
 * enabled defaults to false — the triage stage is opt-in per repository.
 */
export function writeTriageConfig ({ captureDir, options }) {
  fs.mkdirSync(captureDir, { recursive: true })
  const config = {
    enabled: options.triage_enabled === true,
    model: options.triage_model || 'z-ai/glm-5.3-flash',
    budgetUsd: Number(options.triage_budget_usd) || 1,
    maxFindings: Number(options.triage_max_findings) || 50,
    apiKey: process.env.OPENROUTER_API_KEY || undefined
  }
  fs.writeFileSync(`${captureDir}/triage-config.json`, JSON.stringify(config))
  return config
}

/**
 * Read the per-runner triage summaries written by triage-filter.sh and
 * aggregate them into a Slack-ready one-liner. Empty string when the
 * triage stage did not run or triaged nothing.
 */
export function readTriageSummaries ({ captureDir, runners = ['opengrep', 'sveltegrep'] }) {
  const summaries = []
  for (const runner of runners) {
    try {
      summaries.push(JSON.parse(fs.readFileSync(`${captureDir}/${runner}-triage-summary.json`, 'utf8')))
    } catch {
      // runner without a triage summary (not run, disabled, or fail-open)
    }
  }
  const suppressed = summaries.reduce((acc, s) => acc + (s.suppressed ?? 0), 0)
  const annotated = summaries.reduce((acc, s) => acc + (s.annotated ?? 0), 0)
  const cost = summaries.reduce((acc, s) => acc + (s.cost ?? 0), 0)
  if (suppressed + annotated === 0) return { line: '', suppressed: 0, annotated: 0, cost: 0 }
  return {
    line: `\n🤖 FP triage: ${suppressed} suppressed, ${annotated} annotated (LLM cost $${cost.toFixed(2)})`,
    suppressed,
    annotated,
    cost
  }
}
