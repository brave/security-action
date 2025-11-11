import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function execCommand (command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    }).trim()
  } catch (error) {
    console.error(`Command failed: ${command}`)
    console.error(error.message)
    if (error.stdout) console.log('stdout:', error.stdout.toString())
    if (error.stderr) console.error('stderr:', error.stderr.toString())
    throw error
  }
}

function getChangedRuleFiles (actionPath, baseRef) {
  console.log(`Detecting changed rule files between current branch and ${baseRef}...`)

  // Get modified, added, renamed rule files (paths relative to repo root)
  const diffOutput = execCommand(
    `git diff --name-only --diff-filter=AMR origin/${baseRef}...HEAD -- assets/opengrep_rules/`,
    { cwd: actionPath }
  )

  const changedFiles = diffOutput
    .split('\n')
    .filter(f => f.trim())
    .filter(f => (f.endsWith('.yml') || f.endsWith('.yaml')))
    .filter(f => !f.includes('.test.'))
    .filter(f => !f.includes('/generated/'))

  console.log(`Found ${changedFiles.length} changed rule files:`)
  changedFiles.forEach(f => console.log(`  - ${f}`))

  return changedFiles
}

async function runOpengrep (rulesPath, targetPath = '.', specificRules = null) {
  console.log(`Looking for rules in: ${rulesPath}`)

  let ruleFiles

  if (specificRules && specificRules.length > 0) {
    console.log(`Using ${specificRules.length} specific rule files`)
    ruleFiles = specificRules
  } else {
    // Find all rule files, excluding test files and generated rules
    ruleFiles = execCommand(
      `find ${rulesPath} -name '*.yml' -or -name '*.yaml' | grep -v '\\.test\\.' | grep -v '/generated/'`
    ).split('\n').filter(f => f.trim())

    console.log(`Found ${ruleFiles.length} rule files`)
  }

  if (ruleFiles.length === 0) {
    console.log('No rule files found!')
    return { results: [], errors: [] }
  }

  const configArgs = ruleFiles.map(f => `-c ${f}`).join(' ')

  console.log(`Running opengrep on: ${targetPath}`)
  const command = `opengrep --disable-version-check --json ${configArgs} ${targetPath} 2>/dev/null || true`

  const output = execCommand(command, { maxBuffer: 50 * 1024 * 1024 })

  try {
    return JSON.parse(output)
  } catch (e) {
    console.error('Failed to parse opengrep output')
    console.error('Output:', output.substring(0, 1000))
    return { results: [], errors: [] }
  }
}

function groupFindingsByRule (results) {
  const grouped = {}

  for (const result of results) {
    const ruleId = result.check_id
    if (!grouped[ruleId]) {
      grouped[ruleId] = []
    }
    grouped[ruleId].push({
      path: result.path,
      line: result.start.line,
      severity: result.extra.severity,
      message: result.extra.message
    })
  }

  return grouped
}

function calculateDelta (baseGrouped, currentGrouped) {
  const delta = {
    newRules: [], // Rules that only exist in current
    newFindings: {}, // Additional findings in existing rules
    removedFindings: {} // Findings that disappeared
  }

  // Find new rules
  for (const ruleId of Object.keys(currentGrouped)) {
    if (!baseGrouped[ruleId]) {
      delta.newRules.push(ruleId)
      delta.newFindings[ruleId] = currentGrouped[ruleId]
    }
  }

  // Compare existing rules
  for (const ruleId of Object.keys(currentGrouped)) {
    if (baseGrouped[ruleId]) {
      const baseSet = new Set(baseGrouped[ruleId].map(f => `${f.path}:${f.line}`))
      const currentSet = new Set(currentGrouped[ruleId].map(f => `${f.path}:${f.line}`))

      // New findings in this rule
      const newInRule = currentGrouped[ruleId].filter(f => {
        const key = `${f.path}:${f.line}`
        return !baseSet.has(key)
      })

      if (newInRule.length > 0) {
        delta.newFindings[ruleId] = newInRule
      }

      // Removed findings
      const removedInRule = baseGrouped[ruleId].filter(f => {
        const key = `${f.path}:${f.line}`
        return !currentSet.has(key)
      })

      if (removedInRule.length > 0) {
        delta.removedFindings[ruleId] = removedInRule
      }
    }
  }

  return delta
}

export default async function opengrepCompare (options = {}) {
  const targetRepo = options['target-repo'] || options.target_repo
  const targetPath = options['target-path'] || options.target_path
  const localTarget = options['local-target'] || options.local_target
  const baseRef = options['base-ref'] || options.base_ref || 'main'
  const compareRules = options['compare-rules'] !== false // Default true
  const changedRulesOnly = options['changed-rules-only'] !== false // Default true

  const actionPath = path.join(__dirname, '..')

  console.log('='.repeat(60))
  console.log('Opengrep Compare')
  console.log('='.repeat(60))

  // Detect changed rule files if enabled
  let changedRuleFilesRelative = null
  if (changedRulesOnly) {
    try {
      changedRuleFilesRelative = getChangedRuleFiles(actionPath, baseRef)
      if (!changedRuleFilesRelative || changedRuleFilesRelative.length === 0) {
        console.log('\n⚠️  No rule files changed. Nothing to scan.')
        return {
          total: 0,
          rules: 0,
          summary: [],
          findings: {},
          delta: null,
          percentageIncrease: 0,
          baseTotal: 0,
          noChanges: true
        }
      }
    } catch (error) {
      console.error('\n❌ Failed to detect changed rule files')
      console.error('This usually means the base branch is not fetched.')
      console.error('Error:', error.message)
      throw new Error(`Failed to detect changed rule files: ${error.message}`)
    }
  }

  let scanPath
  let tempDir = null
  let shouldCleanup = false

  // Determine scan target
  if (localTarget) {
    console.log(`Using local target: ${localTarget}`)
    scanPath = localTarget
  } else if (targetRepo) {
    console.log(`Target repository: ${targetRepo}`)
    tempDir = path.join('/tmp', `opengrep-scan-${Date.now()}`)
    execCommand(`mkdir -p ${tempDir}`)
    console.log(`Cloning ${targetRepo} (shallow clone)...`)
    execCommand(`git clone --depth 1 https://github.com/${targetRepo}.git ${tempDir}`)
    scanPath = targetPath ? path.join(tempDir, targetPath) : tempDir
    shouldCleanup = true
  } else {
    console.log('Scanning current directory')
    scanPath = '.'
  }

  console.log(`Scan path: ${scanPath}`)

  let baseResults = null
  let baseGrouped = null
  let baseWorktree = null
  let currentWorktree = null

  // Create worktree for current branch (to avoid uncommitted changes)
  currentWorktree = path.join('/tmp', `opengrep-rules-current-${Date.now()}`)
  try {
    execCommand(`git worktree add ${currentWorktree} HEAD`, { cwd: actionPath })
  } catch (e) {
    console.error('\n❌ Failed to create current worktree')
    console.error('Error:', e.message)
    throw new Error(`Failed to create current worktree: ${e.message}`)
  }

  const currentRulesPath = path.join(currentWorktree, 'assets/opengrep_rules')

  // Map changed rule files to current worktree
  let currentRuleFiles = null
  if (changedRuleFilesRelative) {
    currentRuleFiles = changedRuleFilesRelative.map(f => {
      // f is already relative like "assets/opengrep_rules/client/foo.yaml"
      // Just extract the part after "assets/opengrep_rules/"
      const relativePath = f.replace('assets/opengrep_rules/', '')
      return path.join(currentRulesPath, relativePath)
    })
  }

  // If compare-rules is enabled, scan with base branch rules
  if (compareRules) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Scanning with BASE branch rules (${baseRef})`)
    console.log('='.repeat(60))

    // Create worktree for base branch rules
    baseWorktree = path.join('/tmp', `opengrep-rules-base-${Date.now()}`)
    try {
      execCommand(`git worktree add ${baseWorktree} origin/${baseRef}`, { cwd: actionPath })
    } catch (e) {
      // Try fetching first if worktree fails
      console.log(`Fetching ${baseRef}...`)
      try {
        execCommand(`git fetch origin ${baseRef}`, { cwd: actionPath })
        execCommand(`git worktree add ${baseWorktree} origin/${baseRef}`, { cwd: actionPath })
      } catch (fetchError) {
        console.error('\n❌ Failed to create base branch worktree')
        console.error('This usually means the base branch is not available.')
        console.error('Make sure to checkout with fetch-depth: 0 and fetch the base branch.')
        console.error('Error:', fetchError.message)
        throw new Error(`Failed to create base branch worktree for ${baseRef}: ${fetchError.message}`)
      }
    }

    const baseRulesPath = path.join(baseWorktree, 'assets/opengrep_rules')

    // Get the same rule files from base branch (if they exist)
    let baseRuleFiles = null
    if (changedRuleFilesRelative) {
      baseRuleFiles = changedRuleFilesRelative.map(f => {
        // f is already relative like "assets/opengrep_rules/client/foo.yaml"
        const relativePath = f.replace('assets/opengrep_rules/', '')
        return path.join(baseRulesPath, relativePath)
      }).filter(f => {
        // Only include files that exist in base branch
        try {
          execCommand(`test -f "${f}"`)
          return true
        } catch {
          console.log(`  Skipping ${path.basename(f)} (new file, doesn't exist in base)`)
          return false
        }
      })
    }

    baseResults = await runOpengrep(baseRulesPath, scanPath, baseRuleFiles)
    baseGrouped = groupFindingsByRule(baseResults.results)

    console.log(`Base branch findings: ${baseResults.results.length}`)
  }

  // Scan with current branch rules
  console.log(`\n${'='.repeat(60)}`)
  console.log('Scanning with CURRENT branch rules (HEAD)')
  console.log('='.repeat(60))

  const currentResults = await runOpengrep(currentRulesPath, scanPath, currentRuleFiles)
  const currentGrouped = groupFindingsByRule(currentResults.results)

  console.log(`Current branch findings: ${currentResults.results.length}`)

  // Calculate delta if we have base results
  let delta = null
  let percentageIncrease = 0

  if (baseResults) {
    delta = calculateDelta(baseGrouped, currentGrouped)

    const baseTotal = baseResults.results.length
    const currentTotal = currentResults.results.length
    const increase = currentTotal - baseTotal

    if (baseTotal > 0) {
      percentageIncrease = ((increase / baseTotal) * 100).toFixed(2)
    } else if (currentTotal > 0) {
      percentageIncrease = 100
    }

    const newFindingsCount = Object.values(delta.newFindings).flat().length
    const removedFindingsCount = Object.values(delta.removedFindings).flat().length

    console.log(`\n${'='.repeat(60)}`)
    console.log('Delta Analysis:')
    console.log('='.repeat(60))
    console.log(`Base findings: ${baseTotal}`)
    console.log(`Current findings: ${currentTotal}`)
    console.log(`Net change: ${increase >= 0 ? '+' : ''}${increase} (${percentageIncrease}%)`)
    console.log(`New findings: ${newFindingsCount}`)
    console.log(`Removed findings: ${removedFindingsCount}`)
    console.log(`New rules introduced: ${delta.newRules.length}`)
  }

  // Display summary
  console.log(`\n${'='.repeat(60)}`)
  console.log('Findings by Rule:')
  console.log('='.repeat(60))

  const sortedRules = Object.entries(currentGrouped).sort((a, b) => b[1].length - a[1].length)
  const summary = []

  for (const [ruleId, findings] of sortedRules) {
    const severity = findings[0]?.severity || 'UNKNOWN'
    const isNewRule = delta && delta.newRules.includes(ruleId)
    const newInRule = delta && delta.newFindings[ruleId] ? delta.newFindings[ruleId].length : 0
    const marker = isNewRule ? ' [NEW RULE]' : (newInRule > 0 ? ` [+${newInRule}]` : '')

    console.log(`\n${ruleId} (${severity}): ${findings.length} findings${marker}`)

    summary.push({
      rule: ruleId,
      severity,
      count: findings.length,
      isNew: isNewRule,
      newFindings: newInRule
    })

    // Show top 5 files for this rule
    const fileGroups = {}
    for (const f of findings) {
      if (!fileGroups[f.path]) fileGroups[f.path] = 0
      fileGroups[f.path]++
    }

    const topFiles = Object.entries(fileGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    for (const [file, count] of topFiles) {
      console.log(`  - ${file}: ${count}`)
    }

    if (Object.keys(fileGroups).length > 5) {
      console.log(`  ... and ${Object.keys(fileGroups).length - 5} more files`)
    }
  }

  // Cleanup
  if (currentWorktree) {
    console.log('\nCleaning up current branch worktree...')
    execCommand(`git worktree remove ${currentWorktree}`, { cwd: actionPath })
  }

  if (baseWorktree) {
    console.log('Cleaning up base branch worktree...')
    execCommand(`git worktree remove ${baseWorktree}`, { cwd: actionPath })
  }

  if (shouldCleanup && tempDir) {
    console.log('Cleaning up target repository...')
    execCommand(`rm -rf ${tempDir}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('Summary:')
  console.log('='.repeat(60))
  console.log(`Total findings: ${currentResults.results.length}`)
  console.log(`Rules triggered: ${Object.keys(currentGrouped).length}`)
  if (delta) {
    console.log(`Percentage change: ${percentageIncrease}%`)
  }

  return {
    total: currentResults.results.length,
    rules: Object.keys(currentGrouped).length,
    summary,
    findings: currentGrouped,
    delta: delta || null,
    percentageIncrease: delta ? parseFloat(percentageIncrease) : 0,
    baseTotal: baseResults ? baseResults.results.length : null,
    noChanges: false
  }
}

export function generateMarkdownSummary (findings, ruleStats, delta, percentageIncrease, baseTotal, targetRepo, baseRef) {
  let markdown = '## Opengrep Findings\n\n'

  if (Object.keys(findings).length === 0) {
    markdown += '✅ No Opengrep findings detected.\n'
    return markdown
  }

  const totalFindings = Object.values(findings).flat().length

  // Show delta information if available
  if (delta && baseTotal !== null) {
    const increase = totalFindings - baseTotal
    const increaseIcon = increase > 0 ? '📈' : increase < 0 ? '📉' : '➡️'
    const newFindingsCount = Object.values(delta.newFindings).flat().length

    markdown += `${increaseIcon} **Comparison Results**\n\n`
    markdown += `- Base branch findings: **${baseTotal}**\n`
    markdown += `- Current branch findings: **${totalFindings}**\n`
    markdown += `- Net change: **${increase >= 0 ? '+' : ''}${increase}** (${percentageIncrease}%)\n`
    markdown += `- New findings from rule changes: **${newFindingsCount}**\n`
    markdown += `- New rules introduced: **${delta.newRules.length}**\n\n`

    if (newFindingsCount === 0 && delta.newRules.length === 0) {
      markdown += '✅ No new findings introduced by rule changes.\n'
      return markdown
    }
  } else {
    markdown += `Found **${totalFindings}** findings across **${Object.keys(findings).length}** rules.\n\n`
  }

  // Summary table
  markdown += '### Summary by Rule\n\n'
  markdown += '| Rule ID | Findings | Severity | Change |\n'
  markdown += '|---------|----------|----------|--------|\n'

  for (const rule of ruleStats) {
    const changeInfo = rule.isNew
      ? '🆕 New'
      : rule.newFindings > 0
        ? `+${rule.newFindings}`
        : '-'
    markdown += `| \`${rule.rule}\` | ${rule.count} | ${rule.severity} | ${changeInfo} |\n`
  }

  markdown += '\n### Detailed Findings\n\n'

  // Detailed findings
  for (const [ruleId, ruleFindings] of Object.entries(findings)) {
    markdown += `#### \`${ruleId}\` (${ruleFindings.length} findings)\n\n`

    // Group by file
    const byFile = {}
    for (const finding of ruleFindings) {
      if (!byFile[finding.path]) {
        byFile[finding.path] = []
      }
      byFile[finding.path].push(finding)
    }

    // Show max 10 files per rule
    const files = Object.keys(byFile).slice(0, 10)
    for (const file of files) {
      const fileFindings = byFile[file]
      markdown += `- **${file}**\n`

      // Show max 3 findings per file
      const maxFindings = fileFindings.slice(0, 3)
      for (const f of maxFindings) {
        // Generate GitHub link if we have target repo
        if (targetRepo) {
          const githubUrl = `https://github.com/${targetRepo}/blob/${baseRef}/${f.path}#L${f.line}`
          markdown += `  - [Line ${f.line}](${githubUrl})\n`
        } else {
          markdown += `  - Line ${f.line}\n`
        }
      }

      if (fileFindings.length > 3) {
        markdown += `  - ... and ${fileFindings.length - 3} more\n`
      }
    }

    if (Object.keys(byFile).length > 10) {
      markdown += `\n... and ${Object.keys(byFile).length - 10} more files\n`
    }

    markdown += '\n'
  }

  return markdown
}
