/**
 * Property tests for filterExistingFiles (fast-check).
 */
import { test } from 'node:test'
import assert from 'assert'
import fc from 'fast-check'
import fs from 'fs'
import os from 'os'
import path from 'path'
import filterExistingFiles from './filterExistingFiles.js'

// Path segments without dots to avoid '.'/'..' traversal from random input
const chars = 'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')
const segmentArb = fc.array(fc.constantFrom(...chars), { minLength: 1, maxLength: 12 })
  .map(segments => segments.join(''))
const filePathArb = fc.array(segmentArb, { minLength: 1, maxLength: 5 })
  .map(segments => segments.join('/'))

function makeWorkspace (files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'secact-prop-'))
  for (const file of files) {
    const target = path.join(root, file)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, 'x')
  }
  return root
}

test('property: kept paths are an order-preserving subset of the input', async () => {
  await fc.assert(fc.asyncProperty(
    fc.uniqueArray(filePathArb, { minLength: 0, maxLength: 20 }),
    async files => {
      const root = makeWorkspace(files)
      try {
        const kept = filterExistingFiles(files, { workspaceRoot: root })
        assert.deepEqual(kept, files)
      } finally {
        fs.rmSync(root, { recursive: true, force: true })
      }
    }
  ), { numRuns: 25 })
})

test('property: missing paths are exactly the reported drops', async () => {
  await fc.assert(fc.asyncProperty(
    fc.uniqueArray(filePathArb, { minLength: 2, maxLength: 20 }),
    fc.subarray([], { minLength: 0, maxLength: 0 }),
    async (files, _unused) => {
      // Create only every second file; the rest are missing
      const existing = files.filter((_, i) => i % 2 === 0)
      const missing = files.filter((_, i) => i % 2 === 1)
      const root = makeWorkspace(existing)
      try {
        let reported = null
        const kept = filterExistingFiles(files, {
          workspaceRoot: root,
          onDropped: drops => { reported = drops }
        })
        assert.deepEqual(kept, existing)
        assert.deepEqual(reported, missing)
        // Partition holds: kept + dropped covers the input exactly
        assert.equal(kept.length + missing.length, files.length)
      } finally {
        fs.rmSync(root, { recursive: true, force: true })
      }
    }
  ), { numRuns: 25 })
})

test('property: default workspace root honours GITHUB_WORKSPACE then cwd', async () => {
  await fc.assert(fc.asyncProperty(filePathArb, async file => {
    const root = makeWorkspace([file])
    const previousCwd = process.cwd()
    const previousWorkspace = process.env.GITHUB_WORKSPACE
    try {
      // GITHUB_WORKSPACE wins when set
      process.env.GITHUB_WORKSPACE = root
      assert.deepEqual(filterExistingFiles([file]), [file])
      assert.deepEqual(filterExistingFiles(['nope/' + file]), [])
      // falls back to cwd when unset
      delete process.env.GITHUB_WORKSPACE
      process.chdir(root)
      assert.deepEqual(filterExistingFiles([file]), [file])
      assert.deepEqual(filterExistingFiles(['nope/' + file]), [])
    } finally {
      if (previousWorkspace === undefined) delete process.env.GITHUB_WORKSPACE
      else process.env.GITHUB_WORKSPACE = previousWorkspace
      process.chdir(previousCwd)
      fs.rmSync(root, { recursive: true, force: true })
    }
  }), { numRuns: 10 })
})
