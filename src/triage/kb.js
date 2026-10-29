/**
 * Chromium knowledge-base loader and scoper for LLM findings generation.
 *
 * Layout (produced by scripts/kb/opengrep-to-kb.mjs):
 *   <root>/rules/<dir>/<name>.md        rule files (frontmatter + body)
 *   <root>/rules/<dir>/COMMON_METADATA  agentic_review capability groups
 *
 * A rule applies to a changed file when the file matches one of the rule's
 * path expressions (from COMMON_METADATA, default ".*") and the file
 * extension matches one of the rule's languages.
 */
import path from 'node:path'

const LANGUAGE_EXTS = {
  go: ['.go'],
  cpp: ['.c', '.cc', '.cpp', '.cxx', '.h', '.hh', '.hpp', '.hxx', '.ino', '.mm'],
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  typescript: ['.ts', '.tsx'],
  java: ['.java'],
  python: ['.py'],
  rust: ['.rs'],
  text: null
}

export function extsForLanguages (languages) {
  const set = new Set()
  for (const l of languages ?? []) {
    const exts = LANGUAGE_EXTS[l]
    if (exts) for (const e of exts) set.add(e)
  }
  return set.size ? set : null
}

export function parseFrontmatter (md) {
  const m = String(md).match(/^---\n([\s\S]*?)\n---\n?/)
  const fm = { name: null, rubric: null, severity: null, languages: [], cwe: [] }
  if (!m) return fm
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (!kv) continue
    const [, k, vRaw] = kv
    const list = vRaw.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean)
    if (k === 'languages' || k === 'cwe') fm[k] = list
    else fm[k] = vRaw
  }
  return fm
}

/**
 * Parse COMMON_METADATA: per capability group, a path_expression and the
 * rule paths it scopes. Returns { "rules/<dir>/<file>.md": [expr, ...] }.
 */
export function parseCommonMetadata (text) {
  const map = {}
  const groupRe = /capability_groups\s*\{([^}]*)\}/g
  for (const m of String(text).matchAll(groupRe)) {
    const expr = m[1].match(/path_expression:\s*"([^"]*)"/)?.[1]
    if (!expr) continue
    const ruleRe = /rules:\s*"([^"]+)"/g
    for (const r of m[1].matchAll(ruleRe)) {
      const key = r[1].replace(/^rules\//, '')
      ;(map[key] ??= []).push(expr)
    }
  }
  return map
}

/**
 * Load every rule in <root>/rules/<dir>/*.md plus its path expressions.
 * Returns [{ dir, file, name, rubric, severity, languages, cwe, body,
 * pathExpressions }].
 */
export function loadKb ({ root, dirs, fsi }) {
  const rulesRoot = path.join(root, 'rules')
  const kbDirs = dirs ?? fsi.readdirSync(rulesRoot).filter((d) => fsi.readdirSync(path.join(rulesRoot, d)).length > 0)
  const rules = []
  for (const dir of kbDirs) {
    const dirPath = path.join(rulesRoot, dir)
    let metaMap = {}
    let files = []
    try {
      files = fsi.readdirSync(dirPath)
    } catch {
      continue
    }
    const metaFile = files.find((f) => f === 'COMMON_METADATA')
    if (metaFile) metaMap = parseCommonMetadata(fsi.readFileSync(path.join(dirPath, metaFile), 'utf8'))
    for (const f of files.filter((x) => x.endsWith('.md')).sort()) {
      const md = fsi.readFileSync(path.join(dirPath, f), 'utf8')
      const fm = parseFrontmatter(md)
      const body = md.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
      const key = `${dir}/${f}`
      rules.push({
        dir,
        file: f,
        name: fm.name ?? key,
        rubric: fm.rubric,
        severity: fm.severity,
        languages: fm.languages,
        cwe: fm.cwe,
        body,
        pathExpressions: metaMap[key] ?? ['.*']
      })
    }
  }
  return rules
}

function exprMatches (expr, file) {
  try {
    return new RegExp(`^(?:${expr})`).test(file)
  } catch {
    return false
  }
}

function languageMatches (rule, file) {
  const exts = extsForLanguages(rule.languages)
  if (!exts) return true
  for (const e of exts) {
    if (file.endsWith(e)) return true
  }
  return false
}

/**
 * Scope rules to a set of changed files. A rule matches a file when the file
 * matches one of the rule's path expressions AND its language matches. Rules
 * with no matching files are dropped.
 * Returns [{ rule, files }] with files = the changed files in scope.
 */
export function scopeRules ({ rules, changedFiles }) {
  const out = []
  for (const rule of rules) {
    const files = changedFiles.filter((f) => rule.pathExpressions.some((e) => exprMatches(e, f)) && languageMatches(rule, f))
    if (files.length) out.push({ rule, files })
  }
  return out
}
