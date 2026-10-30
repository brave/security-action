#!/usr/bin/env node
/**
 * Port our opengrep rules (assets/opengrep_rules) to the chromium agents
 * knowledge-base markdown format (agents/knowledge_base/rules/<dir>/<name>.md).
 *
 * Usage:
 *   node scripts/kb/opengrep-to-kb.mjs \
 *     [--rules assets/opengrep_rules] \
 *     [--dirs client,services,generated/oss] \
 *     [--out assets/knowledge_base]
 *
 * Mapping (deterministic, no LLM):
 *   id                 -> name: <kbDir>/<kebab-id>, file <kebab-id>.md
 *   severity ERROR/WARNING -> should_fix; INFO -> nit
 *   category security/privacy -> rubric safety; anything else -> correctness
 *   message            -> **Rule.** (verbatim)
 *   metadata.cwe/references + rule shape -> **Why.**
 *   patterns           -> Examples Bad:; pattern-not* / sanitizers -> Good:
 *   every literal pattern -> ## Detection hints (search terms for the agent)
 *   paths.include globs -> COMMON_METADATA agentic_review path_expression
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadAll } from 'js-yaml'

export function kebab (id) {
  const k = String(id).replace(/_/g, '-').trim()
  if (k.length <= 80) return k
  let h = 5381
  for (const c of k) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0
  return `${k.slice(0, 80)}-${h.toString(36)}`
}

export function kbDirOf (sourceRel) {
  const parts = String(sourceRel).split('/')
  return parts.length > 2 ? parts[parts.length - 2] : parts[0]
}

export function rubricOf (rule) {
  const cat = rule.metadata?.category
  return cat === 'security' || cat === 'privacy' ? 'safety' : 'correctness'
}

export function severityOf (rule) {
  return rule.severity === 'INFO' ? 'nit' : 'should_fix'
}

const FENCE = { go: 'go', cpp: 'cpp', c: 'cpp', java: 'java', js: 'javascript', ts: 'typescript', py: 'python', python: 'python', rust: 'rust' }
export function fenceLang (rule) {
  const first = Array.isArray(rule.languages) ? rule.languages[0] : undefined
  return FENCE[first] ?? 'text'
}

/**
 * Collect string leaves under pattern-ish keys. Returns [{ s, inNot }] where
 * inNot marks leaves nested under a pattern-not* key (the rule's exclusions).
 */
function walkStrings (node, keyRe, inNot = false, out = []) {
  if (typeof node === 'string') return out
  if (Array.isArray(node)) {
    for (const v of node) walkStrings(v, keyRe, inNot, out)
    return out
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const not = inNot || /^pattern-not(-inside|-regex)?$/.test(k)
      if (typeof v === 'string') {
        if (keyRe.test(k)) out.push({ s: v.trim(), inNot: not })
      } else {
        walkStrings(v, keyRe, not, out)
      }
    }
  }
  return out
}

const PATTERN_KEYS = /^(pattern|pattern-regex|pattern-not-regex|pattern-inside|pattern-not|pattern-not-inside|regex)$/
const MATCH_KEYS = /^(pattern|pattern-regex)$/

const dedup = (list) => [...new Set(list.map((x) => x.s))]

export function detectionHints (rule) {
  return dedup(walkStrings(rule, PATTERN_KEYS))
}

export function badExamples (rule) {
  if (rule.mode === 'taint') {
    const src = dedup(walkStrings(rule['pattern-sources'] ?? {}, MATCH_KEYS))
    const sink = dedup(walkStrings(rule['pattern-sinks'] ?? {}, MATCH_KEYS))
    return { sources: src, sinks: sink, list: [...src, ...sink] }
  }
  return { list: dedup(walkStrings(rule.patterns ?? rule.pattern ?? {}, MATCH_KEYS).filter((x) => !x.inNot)) }
}

export function goodExamples (rule) {
  if (rule.mode === 'taint') {
    return dedup(walkStrings(rule['pattern-sanitizers'] ?? {}, MATCH_KEYS))
  }
  return dedup(walkStrings(rule.patterns ?? rule.pattern ?? {}, PATTERN_KEYS).filter((x) => x.inNot))
}

export function cweList (rule) {
  const cwe = rule.metadata?.cwe
  if (!cwe) return []
  return (Array.isArray(cwe) ? cwe : [cwe]).map(String)
}

const oneLine = (s) => String(s).replace(/\s+/g, ' ').trim()

export function convertRule (rule, sourceRel, stem = kebab(rule.id)) {
  const id = String(rule.id)
  const kbDir = kbDirOf(sourceRel)
  const name = `${kbDir}/${stem}`
  const lang = fenceLang(rule)
  const cwes = cweList(rule)
  const bad = badExamples(rule)
  const good = goodExamples(rule)
  const hints = detectionHints(rule)
  const references = (rule.metadata?.references ?? []).map(String)

  const why = [
    ...(cwes.length ? [`Reported as ${cwes.join('; ')}.`] : []),
    ...(rule.mode === 'taint' ? ['Untrusted data matching the source patterns reaches the sink without passing a sanitizer.'] : []),
    ...references.map((r) => `See ${r}.`),
    `Ported from opengrep rule \`${id}\` (${sourceRel}).`
  ].join(' ')

  const badLines = []
  if (rule.mode === 'taint') {
    if (bad.sources.length) {
      badLines.push('// untrusted input (source)')
      badLines.push(...bad.sources)
    }
    if (bad.sinks.length) {
      badLines.push('// flows to sink without sanitization')
      badLines.push(...bad.sinks)
    }
  } else {
    badLines.push(...bad.list)
  }
  if (!badLines.length) badLines.push('// no static pattern; see Detection hints')

  const lines = [
    '---',
    `name: ${name}`,
    `rubric: ${rubricOf(rule)}`,
    `severity: ${severityOf(rule)}`,
    `languages: [${(rule.languages ?? []).join(', ')}]`,
    ...(cwes.length ? [`cwe: [${cwes.map((c) => c.split(':')[0].trim()).join(', ')}]`] : []),
    '---',
    '',
    `**Rule.** ${oneLine(rule.message)}`,
    '',
    `**Why.** ${why}`,
    '',
    '## Examples',
    '',
    'Bad:',
    '',
    '```' + lang,
    ...badLines,
    '```'
  ]
  if (good.length) {
    lines.push(
      '',
      'Good:',
      '',
      '```' + lang,
      ...good,
      '```'
    )
  }
  if (hints.length) {
    lines.push(
      '',
      '## Detection hints',
      '',
      `Literal patterns from opengrep rule \`${id}\` (metavariables start with \`$\`):`,
      '',
      ...hints.map((h) => `- \`${h}\``)
    )
  }
  return lines.join('\n') + '\n'
}

export function globToRegex (glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')
  return escaped
}

export function pathExpressionOf (rule) {
  const inc = rule.paths?.include
  if (!inc || !inc.length) return null
  return inc.map(globToRegex).join('|')
}

export function loadDocs ({ rulesRoot, dirs, fsi = fs }) {
  const docs = []
  for (const dir of dirs) {
    const full = path.join(rulesRoot, dir)
    for (const f of fsi.readdirSync(full).filter((x) => x.endsWith('.yaml')).sort()) {
      docs.push({ dir, file: f, raw: fsi.readFileSync(path.join(full, f), 'utf8') })
    }
  }
  return docs
}

export function convertTree ({ docs, out, fsi = fs }) {
  const files = new Map()
  const groupsByDir = new Map()
  const usedNames = new Map()

  for (const { dir, file, raw } of docs) {
    const sourceRel = `${dir}/${file}`
    for (const doc of loadAll(raw)) {
      if (!doc || !Array.isArray(doc.rules)) continue
      for (const rule of doc.rules) {
        if (!rule || !rule.id) continue
        const kbDir = kbDirOf(sourceRel)
        const base = kebab(rule.id)
        const taken = usedNames.get(kbDir) ?? new Set()
        let stem = base
        for (let i = 2; taken.has(stem); i++) stem = `${base}-${i}`
        taken.add(stem)
        usedNames.set(kbDir, taken)
        files.set(`${kbDir}/${stem}.md`, convertRule(rule, sourceRel, stem))
        const groups = groupsByDir.get(kbDir) ?? new Map()
        const expr = pathExpressionOf(rule) ?? '.*'
        if (!groups.has(expr)) groups.set(expr, [])
        groups.get(expr).push(`${kbDir}/${stem}`)
        groupsByDir.set(kbDir, groups)
      }
    }
  }

  for (const [kbDir, groups] of groupsByDir) {
    const ordered = [...groups.entries()].sort((a, b) => (a[0] === '.*') - (b[0] === '.*'))
    const lines = ['agentic_review {']
    for (const [expr, rules] of ordered) {
      lines.push('  capability_groups {')
      lines.push(`    path_expression: "${expr}"`)
      for (const r of rules) lines.push(`    rules: "rules/${r}.md"`)
      lines.push('  }')
    }
    lines.push('}')
    lines.push('')
    files.set(`${kbDir}/COMMON_METADATA`, lines.join('\n'))
  }

  if (out) {
    for (const [rel, content] of files) {
      const full = path.join(out, 'rules', rel)
      fsi.mkdirSync(path.dirname(full), { recursive: true })
      fsi.writeFileSync(full, content)
    }
  }
  return files
}

export async function main (argv = process.argv.slice(2)) {
  const arg = (name, fallback) => {
    const i = argv.indexOf(name)
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
  }
  const rulesRoot = arg('--rules', 'assets/opengrep_rules')
  const dirs = (arg('--dirs', 'client,services,generated/oss')).split(',')
  const out = arg('--out', 'assets/knowledge_base')
  const docs = loadDocs({ rulesRoot, dirs })
  const files = convertTree({ docs, out })
  const md = [...files.keys()].filter((k) => k.endsWith('.md')).length
  const perDir = {}
  for (const k of files.keys()) {
    const d = k.split('/')[0]
    perDir[d] = (perDir[d] ?? 0) + 1
  }
  console.log(`converted ${md} rules -> ${out} (${JSON.stringify(perDir)})`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
