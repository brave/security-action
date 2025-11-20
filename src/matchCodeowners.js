/**
 * Match files against CODEOWNERS file patterns.
 * This module reads changed files and identifies their code owners.
 */

import fs from 'fs'
import path from 'path'

/**
 * Find CODEOWNERS file using GitHub's search order:
 * 1. .github/CODEOWNERS
 * 2. CODEOWNERS
 * 3. docs/CODEOWNERS
 */
export function findCodeownersPath (basePath = '.') {
  const searchPaths = [
    path.join(basePath, '.github/CODEOWNERS'),
    path.join(basePath, 'CODEOWNERS'),
    path.join(basePath, 'docs/CODEOWNERS')
  ]

  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      return searchPath
    }
  }

  return null
}

/**
 * Parse CODEOWNERS file and return list of [pattern, owners] entries.
 * Returns patterns in order (more specific patterns should come first).
 */
export function parseCodeowners (codeownersPath) {
  const patterns = []

  if (!codeownersPath || !fs.existsSync(codeownersPath)) {
    return patterns
  }

  const content = fs.readFileSync(codeownersPath, 'utf-8')
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const parts = trimmed.split(/\s+/)
    if (parts.length < 2) {
      continue
    }

    const pattern = parts[0]
    const owners = parts.slice(1)
    patterns.push([pattern, owners])
  }

  return patterns
}

/**
 * Convert CODEOWNERS glob pattern to regex.
 * CODEOWNERS patterns follow gitignore-style glob patterns.
 */
export function patternToRegex (pattern) {
  let regex = pattern

  // Handle glob patterns BEFORE escaping
  // Special case: /**/ should match zero or more directories
  regex = regex.replace(/\/\*\*\//g, '___DOUBLESLASH___')
  // Replace ** with a placeholder
  regex = regex.replace(/\*\*/g, '___DOUBLESTAR___')
  // Replace single * with placeholder
  regex = regex.replace(/\*/g, '___STAR___')

  // Escape special regex characters
  regex = regex.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

  // Replace placeholders with regex patterns
  // /**/ matches zero or more path segments (including none)
  regex = regex.replace(/___DOUBLESLASH___/g, '(/.*)?/')
  // ** matches any number of characters (including /)
  regex = regex.replace(/___DOUBLESTAR___/g, '.*')
  // * matches anything except /
  regex = regex.replace(/___STAR___/g, '[^/]*')

  // If pattern starts with /, it's from root
  if (pattern.startsWith('/')) {
    regex = '^' + regex.substring(1) // Remove leading / and anchor to start
  } else {
    // Pattern can match anywhere in path
    regex = '(^|/)' + regex
  }

  // If pattern ends with /, it matches directories
  if (pattern.endsWith('/')) {
    regex = regex + '.*'
  } else {
    // Match exact file or directory
    regex = regex + '($|/)'
  }

  return new RegExp(regex)
}

/**
 * Find owners for a given file path.
 * Returns the most specific matching pattern's owners.
 * CODEOWNERS uses the last matching pattern (most specific).
 */
export function findOwners (filePath, patterns) {
  let matchedOwners = []

  for (const [pattern, owners] of patterns) {
    const regex = patternToRegex(pattern)
    if (regex.test(filePath)) {
      matchedOwners = owners
    }
  }

  return matchedOwners
}

/**
 * Match changed files against CODEOWNERS patterns.
 * Returns a mapping of owners to their files and files without owners.
 */
export default function matchCodeowners ({
  changedFiles,
  codeownersPath = null,
  basePath = '.',
  debug = false
}) {
  debug = debug === 'true' || debug === true

  // Auto-detect CODEOWNERS file if not specified
  if (!codeownersPath) {
    codeownersPath = findCodeownersPath(basePath)
  }

  if (!codeownersPath) {
    if (debug) {
      console.log('No CODEOWNERS file found')
    }
    return {
      ownersToFiles: {},
      filesWithoutOwners: changedFiles,
      stats: {
        totalFiles: changedFiles.length,
        filesWithOwners: 0,
        filesWithoutOwners: changedFiles.length,
        uniqueOwners: 0,
        teams: 0,
        individuals: 0,
        teamsList: [],
        individualsList: []
      }
    }
  }

  if (debug) {
    console.log(`Loading CODEOWNERS from ${codeownersPath}...`)
  }

  const patterns = parseCodeowners(codeownersPath)

  if (debug) {
    console.log(`Found ${patterns.length} ownership patterns`)
    console.log(`Analyzing ${changedFiles.length} changed files`)
  }

  // Map owners to their files
  const ownersToFiles = {}
  const filesWithoutOwners = []

  for (const filePath of changedFiles) {
    const owners = findOwners(filePath, patterns)

    if (owners.length > 0) {
      for (const owner of owners) {
        if (!ownersToFiles[owner]) {
          ownersToFiles[owner] = []
        }
        ownersToFiles[owner].push(filePath)
      }
    } else {
      filesWithoutOwners.push(filePath)
    }
  }

  // Sort owners by number of affected files (descending)
  const sortedOwners = Object.entries(ownersToFiles)
    .sort((a, b) => b[1].length - a[1].length)

  // Calculate statistics
  const teams = new Set()
  const individuals = new Set()

  for (const owner of Object.keys(ownersToFiles)) {
    if (owner.startsWith('@') && owner.includes('/')) {
      teams.add(owner)
    } else {
      individuals.add(owner)
    }
  }

  const result = {
    ownersToFiles: Object.fromEntries(sortedOwners),
    filesWithoutOwners,
    stats: {
      totalFiles: changedFiles.length,
      filesWithOwners: changedFiles.length - filesWithoutOwners.length,
      filesWithoutOwners: filesWithoutOwners.length,
      uniqueOwners: Object.keys(ownersToFiles).length,
      teams: teams.size,
      individuals: individuals.size,
      teamsList: Array.from(teams).sort(),
      individualsList: Array.from(individuals).sort()
    }
  }

  if (debug) {
    console.log('\nCodeowners matching results:')
    console.log(`- Total files: ${result.stats.totalFiles}`)
    console.log(`- Files with owners: ${result.stats.filesWithOwners}`)
    console.log(`- Files without owners: ${result.stats.filesWithoutOwners}`)
    console.log(`- Unique owners: ${result.stats.uniqueOwners}`)
    console.log(`- Teams: ${result.stats.teams}`)
    console.log(`- Individuals: ${result.stats.individuals}`)
  }

  return result
}
