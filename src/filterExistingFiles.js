/**
 * Drop changed-file paths that do not exist in the checked-out working
 * tree.
 *
 * The pull request files API lists paths as a diff against the current
 * base branch head, but the scanners consume all_changed_files.txt
 * against the checked-out merge commit. Paths that were renamed or
 * deleted on the base branch after the pull request forked are listed
 * yet absent from the working tree, and opening them crashes the
 * scanners (scripttagextractor FileNotFoundError, brave/search#14979).
 */
import fs from 'node:fs'
import path from 'node:path'

export default function filterExistingFiles (files, {
  workspaceRoot = process.env.GITHUB_WORKSPACE || process.cwd(),
  _fs = fs,
  onDropped = null
} = {}) {
  const kept = []
  const dropped = []
  for (const file of files) {
    if (_fs.existsSync(path.join(workspaceRoot, file))) {
      kept.push(file)
    } else {
      dropped.push(file)
    }
  }
  if (onDropped && dropped.length > 0) onDropped(dropped)
  return kept
}
