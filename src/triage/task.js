import { stableCaseId } from './verdict.js'

export const DEFAULT_OUTPUT_SCHEMA = {
  label: 'TP|FP|UNKNOWN',
  confidence: 'high|medium|low',
  confidence_score: 0.0,
  reason: 'short explanation grounded in concrete code evidence',
  evidence: [
    { file: 'path/relative/to/repo', lines: 'Lx-Ly', note: 'what this shows' }
  ],
  agent: 'swe-agent|openhands|aider|llm',
  case_id: 'string'
}

const ENV_HINTS = {
  'swe-agent': '- You are running under SWE-agent.\n- Treat your current working directory as the repository root.\n- Do NOT modify any files.\n',
  openhands: '- You are running under OpenHands headless.\n- Treat your current working directory as the repository root.\n- Do NOT modify any files.\n- FINISH your interaction after you have successfully output the result JSON, don\'t repeatedly give JSON output.\n',
  aider: '- You are running under Aider in scripting mode.\n- The runner executes in the repository directory.\n- Aider may propose edits, but you MUST NOT request or perform edits.\n',
  llm: '- You are a pure LLM baseline with no tools.\n- You cannot execute commands; rely solely on the provided prompt text.\n- Do NOT request edits or additional interactions.\n- OUTPUT the JSON result only, with no extra text. You can have long think process.\n',
  generic: '- You are running in an automated headless environment.\n- Treat your working directory as the repository root.\n- Do NOT modify any files.\n'
}

/**
 * Render a triage case JSON into the read-only task prompt (port of the
 * paper's make_task.py build_task_markdown). readFile(path) returns file
 * contents or throws; failures degrade to a placeholder line.
 */
export function formatTask ({ caseJson, repoRoot, readFile, agent = 'generic' }) {
  const cid = stableCaseId(caseJson)
  let tool = caseJson.tool
  if (typeof tool === 'string') tool = [tool]
  const toolList = Array.isArray(tool) ? tool : []
  const effectiveScanRoot = caseJson.scan_root || '.'
  const finding = {
    tool: toolList,
    file: caseJson.file,
    scan_root: effectiveScanRoot,
    raw_output: caseJson.raw_output
  }
  const envHint = ENV_HINTS[agent] ?? ENV_HINTS.generic

  let fileBody
  try {
    fileBody = readFile(`${repoRoot}/${caseJson.file}`)
  } catch {
    fileBody = '<file content unavailable>'
  }

  return `# SAST Alert FP Triage (Read-only)

## Context
- **case_id**: \`${cid}\`
- **repo_root (host)**: \`${repoRoot}\`
- **scan_root (relative)**: \`${effectiveScanRoot}\`

## Environment notes
${envHint}
## Your task
You are a **security-oriented code reviewer**. You are given **one or more SAST findings**.
Treat the SAST tools' message and raw output as hints only; base your decision on what the code actually does and what it is meant to do.

You must triage it into one of:
- \`TP\`: the finding corresponds to a real security vulnerability in this code state.
- \`FP\`: the finding does NOT correspond to a real vulnerability (benign usage, already mitigated, unreachable, wrong pattern match, etc.)
- \`UNKNOWN\`: insufficient information to decide (file not found, code mismatch, ambiguous flows).

Then, output a single JSON object matching the schema below, with the following requirements:

${JSON.stringify(DEFAULT_OUTPUT_SCHEMA, null, 2)}

In the output schema:

- \`label\` must be exactly one of \`TP\`, \`FP\`, \`UNKNOWN\`.
- \`confidence\` must be \`high\`, \`medium\`, or \`low\`.
- \`confidence_score\` must be a float in [0.0, 1.0].
- \`evidence\` must include at least 1 item when label != UNKNOWN.
- Set \`agent\` to your runtime agent name.
- Set \`case_id\` to \`${cid}\`.

### Rules (strict)
1. **READ-ONLY**: Do not edit any files. Do not apply patches. Do not create PRs.
2. Use repo navigation commands/tools to inspect the relevant code:
   - open the reported file and lines;
   - inspect nearby context;
   - follow symbol usage if needed (search/grep).
3. Do not rely on the SAST message to determine impact; verify by understanding the code's purpose and data/control flow.
4. Be conservative about \`TP\`:
    - only label \`TP\` if you can explain a plausible security impact/path grounded in code evidence.
4. Output **a single JSON object only**, with **no markdown**, **no code fences**, and **no extra text**.
5. If you have already produced the JSON output, **stop immediately** and do not continue with further steps or commands. Focus on the format of the JSON output.
6. Produce a parseable JSON string. DO NOT leave double quotes (") if it's in a JSON value, ESCAPE them with backslash, or use backticks (\`) instead. IF YOU CAN'T, remove all double quotes in JSON values.

## Inputs

### File
${fileBody}

### Finding (raw)
${JSON.stringify(finding, null, 2)}
`
}
