import { extname } from 'node:path'

/**
 * Minimal glob to RegExp: a double-star followed by a slash spans zero or
 * more directories, a single star stays within one path segment, a question
 * mark matches a single character.
 */
export function globToRegExp (pattern) {
  let out = ''
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        if (pattern[i + 2] === '/') {
          out += '(?:[^/]+/)*'
          i += 2
        } else {
          out += '.*'
          i++
        }
      } else {
        out += '[^/]*'
      }
    } else if (c === '?') {
      out += '[^/]'
    } else {
      out += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    }
  }
  return new RegExp(`^${out}$`)
}

/**
 * Tool registry for the agentic triage harness. Read-only built-ins
 * (view / grep / find) operate on an injected fs surface rooted at `root`;
 * `exec` is fail-closed (not configured) unless a runner is injected — the
 * production runner wraps commands in the Landlock sandbox.
 *
 * fsi: { readFileSync(path), readdirSync(dir) } — paths are repo-relative
 * or absolute under root; readdirSync returns entry names.
 */
export function createToolRegistry ({ root, fsi, exec = null, maxOutputChars = 20000 } = {}) {
  const join = (p) => `${root.replace(/\/$/, '')}/${String(p).replace(/^\//, '')}`

  const listFiles = (dir) => {
    const out = []
    for (const entry of fsi.readdirSync(dir)) {
      const full = `${dir}/${entry}`
      let entries
      try {
        entries = fsi.readdirSync(full)
      } catch {
        out.push(full)
        continue
      }
      if (entries.length === 0) out.push(full)
      else out.push(...listFiles(full))
    }
    return out
  }

  const globToRegExp = (pattern) => {
    let out = ''
    for (let i = 0; i < pattern.length; i++) {
      const c = pattern[i]
      if (c === '*') {
        if (pattern[i + 1] === '*') {
          if (pattern[i + 2] === '/') {
            out += '(?:[^/]+/)*'
            i += 2
          } else {
            out += '.*'
            i++
          }
        } else {
          out += '[^/]*'
        }
      } else if (c === '?') {
        out += '[^/]'
      } else {
        out += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
      }
    }
    return new RegExp(`^${out}$`)
  }

  const tools = {
    view (args) {
      const file = join(args.file)
      const content = fsi.readFileSync(file)
      const lines = String(content).split('\n')
      if (String(content).endsWith('\n')) lines.pop()
      const start = Math.max(1, Number(args.startLine ?? 1))
      const end = Math.min(lines.length, Number(args.endLine ?? lines.length))
      const out = lines.slice(start - 1, end)
        .map((line, i) => `${start + i}: ${line}`)
        .join('\n')
      return out || '<empty file>'
    },

    grep (args) {
      const re = new RegExp(args.pattern)
      const globRe = args.glob ? globToRegExp(args.glob) : null
      const matches = []
      for (const path of listFiles(root)) {
        const rel = path.slice(root.length + 1)
        if (globRe && !globRe.test(rel)) continue
        let content
        try {
          content = fsi.readFileSync(path)
        } catch {
          continue
        }
        const lines = String(content).split('\n')
        for (let i = 0; i < lines.length; i++) {
          if (re.test(lines[i])) {
            matches.push(`${path}:${i + 1}: ${lines[i].trim()}`)
            if (matches.length >= 200) return matches.join('\n')
          }
        }
      }
      return matches.length ? matches.join('\n') : 'no matches'
    },

    find (args) {
      const re = globToRegExp(args.pattern)
      const found = listFiles(root).filter(p => re.test(p.slice(root.length + 1)))
      return found.length ? found.join('\n') : 'no matches'
    },

    done (args) {
      return args
    }
  }

  const registry = {
    root,
    names () {
      return Object.keys(tools).concat(exec ? ['exec'] : [])
    },

    schema () {
      const schemas = {
        view: {
          description: 'Read a file (or a line range) from the repository.',
          parameters: {
            type: 'object',
            properties: {
              file: { type: 'string', description: 'repo-relative path' },
              startLine: { type: 'integer', description: '1-based, default 1' },
              endLine: { type: 'integer', description: '1-based inclusive, default EOF' }
            },
            required: ['file']
          }
        },
        grep: {
          description: 'Regex search across repository files.',
          parameters: {
            type: 'object',
            properties: {
              pattern: { type: 'string' },
              glob: { type: 'string', description: 'optional glob filter, e.g. **/*.java' }
            },
            required: ['pattern']
          }
        },
        find: {
          description: 'List repository files matching a glob pattern.',
          parameters: {
            type: 'object',
            properties: { pattern: { type: 'string', description: 'glob, e.g. **/*.java' } },
            required: ['pattern']
          }
        },
        done: {
          description: 'Return the final triage verdict and finish the task.',
          parameters: {
            type: 'object',
            properties: {
              label: { type: 'string', enum: ['TP', 'FP', 'UNKNOWN'] },
              confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
              confidence_score: { type: 'number' },
              reason: { type: 'string' },
              evidence: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    file: { type: 'string' },
                    lines: {},
                    note: { type: 'string' }
                  }
                }
              }
            },
            required: ['label', 'confidence', 'confidence_score', 'reason', 'evidence']
          }
        },
        exec: {
          description: 'Run a sandboxed command in the repository (read-only egress).',
          parameters: {
            type: 'object',
            properties: { command: { type: 'string' } },
            required: ['command']
          }
        }
      }
      return registry.names().map(name => ({ type: 'function', function: { name, ...schemas[name] } }))
    },

    async run (name, args) {
      if (name === 'exec') {
        if (!exec) return { ok: false, error: 'exec tool not configured' }
        try {
          return { ok: true, output: String(await exec(args.command ?? '')) }
        } catch (err) {
          return { ok: false, error: err.message }
        }
      }
      const fn = tools[name]
      if (!fn) return { ok: false, error: `Unknown tool: ${name}` }
      try {
        const out = fn(args ?? {})
        return { ok: true, output: String(out).slice(0, maxOutputChars) }
      } catch (err) {
        return { ok: false, error: err.message }
      }
    }
  }

  return registry
}

/** File-extension guard: view/grep/find only ever need to read source files. */
export function isSourcePath (path) {
  const src = new Set(['.java', '.c', '.cc', '.cpp', '.h', '.hpp', '.py', '.js', '.ts', '.rb', '.go', '.rs', '.cjs', '.mjs', '.kt', '.scala', '.properties', '.xml', '.json', '.yaml', '.yml', '.md', '.txt', '.cpp', '.cxx'])
  return src.has(extname(String(path)))
}
