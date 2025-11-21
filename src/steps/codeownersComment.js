/**
 * Generate and post a GitHub comment showing code owners for changed files.
 * Removes old codeowners comments and posts a new one.
 */

import crypto from 'crypto'

const COMMENT_IDENTIFIER = '<!-- security-action:codeowners-summary -->'
const MAX_FILES_BEFORE_COLLAPSE = 5

/**
 * Generate GitHub PR file diff anchor hash
 * GitHub uses SHA256 hash of the file path for #diff-<hash> anchors
 */
function generateFileDiffHash (filePath) {
  return crypto.createHash('sha256').update(filePath).digest('hex')
}

/**
 * Format file list with collapsible details if needed
 */
function formatFileList (files, repoOwner, repoName, prNumber, maxVisible = MAX_FILES_BEFORE_COLLAPSE, maxCollapsed = null) {
  const sortedFiles = files.sort()

  if (sortedFiles.length === 0) {
    return ''
  }

  let output = ''

  // Show first N files directly
  const visibleFiles = sortedFiles.slice(0, maxVisible)
  for (const file of visibleFiles) {
    const diffHash = generateFileDiffHash(file)
    const fileUrl = `https://github.com/${repoOwner}/${repoName}/pull/${prNumber}/files#diff-${diffHash}`
    output += `- [\`${file}\`](${fileUrl})\n`
  }

  // Collapse remaining files if more than maxVisible
  if (sortedFiles.length > maxVisible) {
    const remainingFiles = sortedFiles.slice(maxVisible)
    const collapsedFiles = maxCollapsed ? remainingFiles.slice(0, maxCollapsed) : remainingFiles
    const truncatedCount = remainingFiles.length - collapsedFiles.length

    output += '\n<details>\n'
    output += `<summary>... and ${remainingFiles.length} more files</summary>\n\n`

    for (const file of collapsedFiles) {
      const diffHash = generateFileDiffHash(file)
      const fileUrl = `https://github.com/${repoOwner}/${repoName}/pull/${prNumber}/files#diff-${diffHash}`
      output += `- [\`${file}\`](${fileUrl})\n`
    }

    if (truncatedCount > 0) {
      output += `\n_... and ${truncatedCount} more files (truncated due to comment length limit)_\n`
    }

    output += '</details>\n'
  }

  return output
}

/**
 * Generate markdown comment body with automatic truncation if too long
 */
function generateCommentBody (matchResult, repoOwner, repoName, prNumber, maxCollapsed = null) {
  const { ownersToFiles, filesWithoutOwners, stats } = matchResult

  let body = COMMENT_IDENTIFIER + '\n'
  body += '## 📋 Code Owners Summary\n\n'

  if (stats.uniqueOwners === 0 && stats.filesWithoutOwners === 0) {
    body += '_No files require code owner review._\n'
    return body
  }

  body += `**${stats.totalFiles}** file(s) changed\n`
  body += `- **${stats.filesWithOwners}** with assigned owners\n`
  body += `- **${stats.filesWithoutOwners}** without owners\n\n`

  if (stats.teams > 0) {
    body += `**${stats.teams}** team(s) affected: ${stats.teamsList.join(', ')}\n`
  }

  if (stats.individuals > 0) {
    body += `**${stats.individuals}** individual(s) affected: ${stats.individualsList.join(', ')}\n`
  }

  body += '\n---\n\n'

  // Show owners sorted by number of files
  if (Object.keys(ownersToFiles).length > 0) {
    body += '### Owners and Their Files\n\n'

    for (const [owner, files] of Object.entries(ownersToFiles)) {
      const ownerDisplay = owner.startsWith('@') ? owner : `@${owner}`
      body += `#### ${ownerDisplay} — ${files.length} file(s)\n\n`
      body += formatFileList(files, repoOwner, repoName, prNumber, MAX_FILES_BEFORE_COLLAPSE, maxCollapsed)
      body += '\n'
    }
  }

  // Show files without owners
  if (filesWithoutOwners.length > 0) {
    body += '### ⚠️ Files Without Owners\n\n'
    body += formatFileList(filesWithoutOwners, repoOwner, repoName, prNumber, MAX_FILES_BEFORE_COLLAPSE, maxCollapsed)
  }

  return body
}

/**
 * Find existing codeowners comment
 */
async function findExistingComment ({ context, github }) {
  const comments = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number
  })

  return comments.data.find(comment =>
    comment.body && comment.body.includes(COMMENT_IDENTIFIER)
  )
}

/**
 * Delete existing codeowners comment
 */
async function deleteExistingComment ({ context, github }) {
  const existingComment = await findExistingComment({ context, github })

  if (existingComment) {
    await github.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existingComment.id
    })
    return true
  }

  return false
}

/**
 * Post or update codeowners comment
 */
export default async function codeownersComment ({
  context,
  github,
  matchResult,
  debug = false
}) {
  const MAX_COMMENT_LENGTH = 65536
  const TRUNCATION_LIMITS = [100, 50, 20, 10, 5, 2, 1, 0]

  debug = debug === 'true' || debug === true

  if (debug) {
    console.log('Generating codeowners comment...')
  }

  // Skip if no files have owners (no CODEOWNERS matches)
  if (matchResult.stats.filesWithOwners === 0) {
    if (debug) {
      console.log('No files have code owners, skipping comment')
    }
    // Still delete any existing comment
    await deleteExistingComment({ context, github })
    return null
  }

  // Skip if no teams/groups are assigned (only individuals)
  if (matchResult.stats.teams === 0) {
    if (debug) {
      console.log('No teams assigned, only individuals, skipping comment')
    }
    // Still delete any existing comment
    await deleteExistingComment({ context, github })
    return null
  }

  // Delete existing comment first
  const deleted = await deleteExistingComment({ context, github })

  if (debug && deleted) {
    console.log('Deleted existing codeowners comment')
  }

  // Generate comment body, trying different truncation limits if needed
  let body = generateCommentBody(
    matchResult,
    context.repo.owner,
    context.repo.repo,
    context.issue.number,
    null // No truncation initially
  )

  // If body is too long, progressively reduce collapsed file limit
  let truncationIndex = 0
  while (body.length > MAX_COMMENT_LENGTH && truncationIndex < TRUNCATION_LIMITS.length) {
    const maxCollapsed = TRUNCATION_LIMITS[truncationIndex]
    if (debug) {
      console.log(`Comment too long (${body.length} chars), reducing collapsed files to ${maxCollapsed}...`)
    }

    body = generateCommentBody(
      matchResult,
      context.repo.owner,
      context.repo.repo,
      context.issue.number,
      maxCollapsed
    )
    truncationIndex++
  }

  // If still too long, truncate the body directly as last resort
  if (body.length > MAX_COMMENT_LENGTH) {
    const truncationMessage = '\n\n---\n\n_Comment truncated due to length limit. See PR Files tab for complete list._'
    body = body.substring(0, MAX_COMMENT_LENGTH - truncationMessage.length) + truncationMessage
    if (debug) {
      console.log(`Comment still too long, truncated to ${MAX_COMMENT_LENGTH} chars`)
    }
  }

  if (debug) {
    console.log(`Final comment length: ${body.length} chars`)
    console.log('Comment body:')
    console.log(body)
  }

  // Post new comment
  const comment = await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body
  })

  if (debug) {
    console.log(`Posted codeowners comment: ${comment.data.html_url}`)
  }

  return comment.data
}
