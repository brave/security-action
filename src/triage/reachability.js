// Reachability evidence for the triage harness.
//
// Two substrates:
// 1. Scanner rule inspection: opengrep rules that declare taint mode
//    (pattern-sources + pattern-sinks) carry a higher reachability prior
//    than purely syntactic pattern rules.
// 2. A text-level call graph: enclosing-function detection plus caller search
//    over the repository, walked breadth-first back to servlet-style entry
//    points. Crude, but it packages exactly the cross-file navigation the
//    agent would otherwise spend grep rounds on (paper pattern P1).

const DECL_PATTERNS = [
  // Java-style: modifier(s), optional type tokens, name, parameter list.
  /^\s*(?:(?:public|private|protected|static|final|abstract|synchronized|native|default|void)\s+)(?:[\w<>[\],.\s]*?\s)?([\w$]+)\s*\([^)]*\)/,
  // JavaScript / TypeScript function declarations.
  /^\s*(?:export\s+)?(?:async\s+)?function\s+([\w$]+)\s*\(/,
  // Python def.
  /^\s*(?:async\s+)?def\s+([\w$]+)\s*\(/
]

const DEFAULT_ENTRY_RE = /^(?:doGet|doPost|doPut|doDelete|doHead|service|main|handleRequest|handle|handler|onRequest)$/

const SOURCE_EXT_RE = /\.(?:java|js|mjs|cjs|ts|tsx|jsx|py|rb|go|rs|c|cc|cpp|h|hpp|cs|php|swift|kt|scala|sh)$/

function escapeRe (s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchDecl (line) {
  for (const re of DECL_PATTERNS) {
    const m = line.match(re)
    if (m) return m[1]
  }
  return null
}

function bracesEnclose (lines, declIdx, targetIdx) {
  let depth = 0
  for (let j = declIdx; j <= targetIdx; j++) {
    const line = lines[j]
    if (depth === 0 && !line.includes('{')) continue
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
  }
  return depth > 0
}

export function enclosingFunction ({ fsi, file, line }) {
  let content
  try {
    content = fsi.readFileSync(file)
  } catch {
    return null
  }
  const lines = content.split('\n')
  const targetIdx = Math.min(Math.max(line - 1, 0), lines.length - 1)
  for (let i = targetIdx; i >= 0; i--) {
    const name = matchDecl(lines[i])
    if (name === null) continue
    if (!bracesEnclose(lines, i, targetIdx)) continue
    return { file, name, startLine: i + 1 }
  }
  return null
}

function listFiles (fsi, root, extRe = SOURCE_EXT_RE) {
  const out = []
  const walk = (dir) => {
    let entries
    try {
      entries = fsi.readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      const full = `${dir}/${entry}`
      let sub
      try {
        sub = fsi.readdirSync(full)
      } catch {
        if (extRe.test(full)) out.push(full)
        continue
      }
      if (sub.length === 0) continue
      walk(full)
    }
  }
  walk(root)
  return out.slice(0, 2000)
}

export function findCallers ({ fsi, root, name, maxCallers = 200 }) {
  const callRe = new RegExp(`\\b${escapeRe(name)}\\s*\\(`)
  const callers = []
  for (const file of listFiles(fsi, root)) {
    let content
    try {
      content = fsi.readFileSync(file)
    } catch {
      continue
    }
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (!callRe.test(lines[i])) continue
      if (matchDecl(lines[i]) === name) continue // declaration, not a call
      callers.push({ file, line: i + 1, text: lines[i].trim() })
      if (callers.length >= maxCallers) return callers
    }
  }
  return callers
}

export function reachableFromEntry ({
  fsi,
  root,
  file,
  line,
  entries = DEFAULT_ENTRY_RE,
  maxDepth = 3,
  maxNodes = 64
}) {
  const target = enclosingFunction({ fsi, file, line })
  if (target === null) {
    return { target: null, verdict: 'unknown', chain: '', reason: 'no enclosing function' }
  }
  if (entries.test(target.name)) {
    return { target: target.name, verdict: 'reachable', chain: target.name, reason: 'entry point' }
  }

  const keyOf = (fn) => `${fn.file}:${fn.name}`
  const parents = new Map()
  const visited = new Set([keyOf(target)])
  let frontier = [target]
  let depth = 0
  while (frontier.length > 0 && depth < maxDepth && visited.size < maxNodes) {
    const next = []
    for (const fn of frontier) {
      const sites = findCallers({ fsi, root, name: fn.name })
      for (const site of sites) {
        const callerFn = enclosingFunction({ fsi, file: site.file, line: site.line })
        if (callerFn === null) continue
        if (callerFn.name === fn.name && callerFn.file === fn.file) continue
        const key = keyOf(callerFn)
        if (visited.has(key)) continue
        visited.add(key)
        parents.set(key, fn)
        if (entries.test(callerFn.name)) {
          const chainNames = [callerFn.name]
          let cur = callerFn
          while (parents.has(keyOf(cur))) {
            cur = parents.get(keyOf(cur))
            chainNames.push(cur.name)
          }
          return {
            target: target.name,
            verdict: 'reachable',
            chain: chainNames.join(' <- '),
            reason: 'entry point'
          }
        }
        next.push(callerFn)
      }
    }
    frontier = next
    depth++
  }
  return {
    target: target.name,
    verdict: 'unreachable',
    chain: '',
    reason: visited.size >= maxNodes ? 'node cap' : (depth >= maxDepth ? 'depth cap' : 'no callers found')
  }
}

export async function loadOgRuleModes ({ fsi, root }) {
  const yamlMod = await import('js-yaml')
  const yaml = yamlMod.default ?? yamlMod
  const modes = {}
  for (const file of listFiles(fsi, root, /\.ya?ml$/)) {
    let content
    try {
      content = fsi.readFileSync(file)
    } catch {
      continue
    }
    let docs
    try {
      docs = yaml.loadAll(String(content))
    } catch {
      continue
    }
    for (const doc of docs) {
      const rules = Array.isArray(doc?.rules) ? doc.rules : [doc]
      for (const rule of rules) {
        if (!rule || typeof rule.id !== 'string') continue
        const taint = rule.mode === 'taint' ||
          (rule['pattern-sources'] !== undefined && rule['pattern-sinks'] !== undefined)
        modes[rule.id] = taint ? 'taint' : 'search'
      }
    }
  }
  return modes
}

export function createReachTool ({ ogRules = {}, fsi, root, entries, maxDepth }) {
  // Finding paths are repo-relative (SARIF/scan output); resolve against root.
  const resolve = (p) => {
    const s = String(p)
    if (fsiReadOk(s)) return s
    return `${root.replace(/\/$/, '')}/${s.replace(/^\//, '')}`
  }
  const fsiReadOk = (p) => {
    try {
      fsi.readFileSync(p)
      return true
    } catch {
      return false
    }
  }
  return {
    async run ({ file, line, ruleId }) {
      const out = []
      if (ogRules[ruleId] === 'taint') {
        out.push(`rule ${ruleId}: scanner taint (source->sink confirmed by scanner)`)
      } else {
        const ogMode = ogRules[ruleId] === 'search' ? 'search' : 'unknown'
        out.push(`rule ${ruleId}: scanner ${ogMode}`)
      }

      const path = resolve(file)
      const target = enclosingFunction({ fsi, file: path, line })
      if (target === null) {
        out.push('no enclosing function found')
        return { ok: true, output: out.join('\n') }
      }
      out.push(`enclosing function ${target.name} (${path}:${target.startLine})`)

      const callers = findCallers({ fsi, root, name: target.name })
      if (callers.length === 0) {
        out.push('callers (0)')
      } else {
        out.push(`callers (${callers.length})`)
        for (const c of callers.slice(0, 20)) out.push(`${c.file}:${c.line}: ${c.text}`)
      }

      const reach = reachableFromEntry({ fsi, root, file: path, line, entries, maxDepth })
      if (reach.verdict === 'reachable') {
        out.push(`reachable from entry ${reach.chain.split(' <- ')[0]}: yes (${reach.chain})`)
      } else {
        out.push(`reachable from entry: no (${reach.reason})`)
      }
      return { ok: true, output: out.join('\n') }
    }
  }
}
