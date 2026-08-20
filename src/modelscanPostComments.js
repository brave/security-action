import { spawnSync } from 'child_process'
import path from 'path'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Run modelscan on changed binary files and post file-level review comments.
 *
 * Scanner enable/disable is controlled by a single GitHub Action input
 * `modelscan_enabled` (comma-separated list, default 'all'), forwarded here as
 * `enabledScanners` and passed to the Python audit script via the env var
 * MODELSCAN_ENABLED_SCANNERS. See assets/modelscan-audit.py for the full list.
 *
 * This bypasses reviewdog because reviewdog cannot comment on binary files
 * (diff/parse.go returns ErrNoHunks for binary diffs, so InDiffFile is always
 * false for binaries — see brave/security-action#707).
 *
 * Instead we post file-level review comments directly via
 * POST /repos/{owner}/{repo}/pulls/{pull_number}/comments with subject_type:'file'.
 *
 * @param {Object} opts
 * @param {Object} opts.github       Octokit instance (with graphql)
 * @param {Object} opts.context      GitHub Actions context
 * @param {String} opts.actionPath   Path to the action checkout
 * @param {String} opts.assignees    Comma/space separated assignee list
 * @param {Boolean} opts.debug       Enable debug output
 * @param {String} opts.enabledScanners  Comma-separated scanner list, default 'all'
 * @returns {Promise<undefined>}
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default async function modelscanPostComments ({
  github,
  context,
  actionPath,
  assignees,
  debug = false,
  enabledScanners = 'all',
  _spawn
}) {
  const debugLog = debug ? console.log : () => {}
  const runSpawn = _spawn || spawnSync

  const assetsDir = path.join(actionPath, 'assets')

  // Run Python audit script — emits JSON lines per finding.
  // SCRIPTPATH tells it where all_changed_files.txt lives (assets dir,
  // written by action.cjs) — same convention as reviewdog.sh exports.
  const env = {
    ...process.env,
    SCRIPTPATH: assetsDir,
    MODELSCAN_ENABLED_SCANNERS: enabledScanners || 'all'
  }

  // Run the audit via uv against the action's locked project (uv.lock) —
  // deps are synced by action.cjs before this runs, so --no-sync just execs
  // the project venv python. No cwd: all_changed_files.txt holds
  // repo-relative paths, so the script must run in the workspace
  // (the github-script working dir), not the action checkout.
  const result = runSpawn('uv', [
    'run', '--frozen', '--no-sync',
    '--project', actionPath,
    'python', path.join(assetsDir, 'modelscan-audit.py')
  ], {
    env,
    encoding: 'utf-8',
    timeout: 120_000,
    maxBuffer: 10 * 1024 * 1024
  })

  if (result.error) {
    console.error('modelscan spawn failed:', result.error.message)
  } else if (result.status !== 0) {
    console.warn(`modelscan exited with status ${result.status} — posting partial findings if any`)
  }
  if (result.stderr) {
    debugLog('modelscan stderr:', result.stderr)
  }

  const findings = []
  for (const line of (result.stdout || '').split('\n').filter(Boolean)) {
    try {
      findings.push(JSON.parse(line))
    } catch (_) {
      debugLog('modelscan parse error:', line)
    }
  }

  if (findings.length === 0) {
    debugLog('No modelscan findings')
    return
  }

  debugLog(`modelscan findings: ${findings.length}`, findings.map(f => f.path))

  const owner = context.repo.owner
  const repo = context.repo.repo
  const prNumber = context.issue.number

  // Dedup against existing review threads
  const existingPaths = await _existingModelscanPaths({ github, owner, repo, prNumber, debugLog })

  const MAX_COMMENTS = 10
  const newFindings = []
  const seen = new Set()

  for (const finding of findings) {
    if (newFindings.length >= MAX_COMMENTS) break
    const key = `${finding.path}\x00${finding.description}`
    if (existingPaths.has(finding.path) || seen.has(key)) continue
    seen.add(key)
    newFindings.push(finding)
  }

  if (newFindings.length === 0) {
    debugLog('All modelscan findings already commented')
    return
  }

  debugLog(`Posting ${newFindings.length} modelscan comments`)

  const { data: pr } = await github.rest.pulls.get({ owner, repo, pull_number: prNumber })
  const commitId = pr.head.sha

  for (const finding of newFindings) {
    try {
      await github.rest.pulls.createReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        path: finding.path,
        body: _formatComment(finding, assignees),
        commit_id: commitId,
        side: 'RIGHT',
        subject_type: 'file'
      })
      debugLog(`Posted modelscan comment on ${finding.path}`)
    } catch (e) {
      if (e.status === 422 && e.message && e.message.includes('is not a valid path')) {
        debugLog(`Comment on removed file ${finding.path}: not an error`)
      } else {
        console.error(`Failed to post modelscan comment on ${finding.path}:`, e.message)
      }
    }
  }
}

/**
 * Query existing review threads for modelscan comments on current PR.
 * Returns a Set of paths that already have non-outdated modelscan comments.
 */
async function _existingModelscanPaths ({ github, owner, repo, prNumber, debugLog }) {
  const existing = new Set()
  try {
    const query = `query($owner:String!, $name:String!, $prnumber:Int!) {
      repository(owner:$owner, name:$name) {
        pullRequest(number:$prnumber) {
          reviewThreads(last:100) {
            nodes {
              isOutdated
              path
              comments(first:1) {
                totalCount
                nodes {
                  author { login }
                  body
                }
              }
            }
          }
        }
      }
    }`
    const vars = { owner, name: repo, prnumber: prNumber }
    const res = await github.graphql(query, vars)
    const threads = res.repository.pullRequest.reviewThreads

    for (const thread of threads.nodes) {
      if (thread.isOutdated && thread.comments.totalCount === 1) continue
      const comment = thread.comments.nodes[0]
      if (!comment || comment.author.login !== 'github-actions') continue
      if (!comment.body.includes('<!-- modelscan -->')) continue
      existing.add(thread.path)
    }
    debugLog(`Existing modelscan comment paths: ${existing.size}`)
  } catch (e) {
    debugLog('Failed to query existing modelscan threads:', e.message)
  }
  return existing
}

/**
 * Format assignees as space-separated @mentions.
 * Input is space/comma separated (repo convention, see cleaner.rb).
 */
function _formatMentions (assignees) {
  if (!assignees) return ''
  return assignees.trim().split(/[\s,]+/).filter(Boolean).map(u => `@${u}`).join(' ')
}

/**
 * Format a modelscan finding as a review comment body.
 * Matches existing comment format (cleaner.rb suffix) so
 * commentsNumber.js, cleanupComments.js, and the label trigger
 * all recognize the comment.
 */
function _formatComment (finding, assignees) {
  const lines = [
    `**modelscan: ${finding.severity}** — ${finding.description}`,
    ''
  ]
  if (finding.module && finding.operator) {
    lines.push(`\`${finding.module}.${finding.operator}\``)
  } else if (finding.module) {
    lines.push(`\`${finding.module}\``)
  }
  lines.push('')
  lines.push('Source: https://github.com/brave/security-action')
  const mentions = _formatMentions(assignees)
  if (mentions) {
    lines.push(`<br>Cc ${mentions}`)
  }
  lines.push('')
  lines.push('Please consider an alternative approach that avoids this security concern, or request a review from the sec-team on slack.')
  lines.push('<!-- Category: security -->')
  lines.push('<!-- modelscan -->')
  return lines.join('\n')
}
