/**
 * Tests for the GitHub write guard (fork-PR read-only token handling).
 */
import { test } from 'node:test'
import { strict as assert } from 'assert'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { guardWrite, isForkPermissionError, appendJobSummary } from './githubWriteGuard.js'
import codeownersComment from './steps/codeownersComment.js'

function mockCore () {
  const warnings = []
  return { warnings, warning: (msg) => warnings.push(msg) }
}

function forbiddenError (message = 'Resource not accessible by integration', status = 403) {
  return Object.assign(new Error(message), { status })
}

// ---- isForkPermissionError ----

test('detects fork 403 HttpError', () => {
  assert.ok(isForkPermissionError(forbiddenError()))
  assert.ok(isForkPermissionError(forbiddenError('RESOURCE NOT ACCESSIBLE BY INTEGRATION')))
})

test('detects GraphQL permission error without 403 status', () => {
  const err = Object.assign(new Error('Request failed due to following response errors:'), {
    name: 'GraphqlResponseError',
    status: 200,
    errors: [{ message: 'Resource not accessible by integration' }]
  })
  assert.ok(isForkPermissionError(err))
})

test('rejects 403 with a different message', () => {
  assert.ok(!isForkPermissionError(forbiddenError('Forbidden')))
})

test('rejects other statuses and errors', () => {
  assert.ok(!isForkPermissionError(forbiddenError('Not Found', 404)))
  assert.ok(!isForkPermissionError(forbiddenError('Validation Failed', 422)))
  assert.ok(!isForkPermissionError(new Error('network timeout')))
  assert.ok(!isForkPermissionError(undefined))
  assert.ok(!isForkPermissionError('Resource not accessible by integration'))
})

test('rejects graphql errors about something else', () => {
  const err = Object.assign(new Error('Validation failed'), {
    name: 'GraphqlResponseError',
    errors: [{ message: 'No commits between main and feature' }]
  })
  assert.ok(!isForkPermissionError(err))
})

// ---- guardWrite ----

test('passes through resolved value', async () => {
  assert.equal(await guardWrite(null, 'x', async () => 'value'), 'value')
})

test('skips fork 403: warning logged, resolves undefined', async () => {
  const core = mockCore()
  const res = await guardWrite(core, 'post comment', async () => {
    throw forbiddenError()
  })
  assert.equal(res, undefined)
  assert.equal(core.warnings.length, 1)
  assert.match(core.warnings[0], /post comment/)
  assert.match(core.warnings[0], /read-only/)
})

test('warns to console when core is absent', async () => {
  const logs = []
  const origWarn = console.warn
  console.warn = (msg) => logs.push(msg)
  try {
    await guardWrite(null, 'x', async () => { throw forbiddenError() })
  } finally {
    console.warn = origWarn
  }
  assert.equal(logs.length, 1)
  assert.match(logs[0], /read-only/)
})

test('runs onSkip fallback but still resolves undefined', async () => {
  let ran = false
  const res = await guardWrite(null, 'x', async () => { throw forbiddenError() }, () => {
    ran = true
    return 'fallback result'
  })
  assert.ok(ran)
  assert.equal(res, undefined)
})

test('rethrows non-permission errors', async () => {
  await assert.rejects(
    guardWrite(null, 'x', async () => { throw forbiddenError('Not Found', 404) }),
    /Not Found/
  )
  await assert.rejects(
    guardWrite(null, 'x', async () => { throw forbiddenError('Forbidden') }),
    /Forbidden/
  )
  await assert.rejects(
    guardWrite(null, 'x', async () => { throw new Error('network timeout') }),
    /network timeout/
  )
})

// ---- appendJobSummary ----

test('appends to GITHUB_STEP_SUMMARY when set', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'summary-'))
  const file = path.join(dir, 'summary.md')
  const env = { GITHUB_STEP_SUMMARY: file }
  assert.equal(appendJobSummary('hello', { env }), true)
  assert.equal(appendJobSummary('world\n', { env }), true)
  assert.equal(fs.readFileSync(file, 'utf-8'), 'helloworld\n')
  fs.rmSync(dir, { recursive: true, force: true })
})

test('no-op without GITHUB_STEP_SUMMARY', () => {
  assert.equal(appendJobSummary('x', { env: {} }), false)
})

// ---- codeownersComment end-to-end with a fork-PR mock ----

const matchResult = (() => {
  const files = Array.from({ length: 60 }, (_, i) => `src/file${i}.js`)
  return {
    ownersToFiles: { alice: files },
    stats: {
      totalFiles: 60,
      filesWithOwners: 60,
      uniqueOwners: 1,
      teams: 0,
      teamsList: [],
      individuals: 1,
      individualsList: ['alice']
    }
  }
})()

const context = { repo: { owner: 'test-org', repo: 'test-repo' }, issue: { number: 42 } }

function makeGithub (opts = {}) {
  const calls = { createComment: [], updateComment: [], deleteComment: [] }
  const rejectIf = (flag, params) => {
    if (opts[flag]) throw forbiddenError(opts.failMessage, opts.failStatus)
  }
  const github = {
    paginate: async () => [],
    rest: {
      issues: {
        listComments: async () => ({ data: [] }),
        createComment: async (params) => {
          rejectIf('failCreate', params)
          calls.createComment.push(params)
          return { data: { id: 1, html_url: 'url' } }
        },
        updateComment: async (params) => {
          rejectIf('failUpdate', params)
          calls.updateComment.push(params)
          return { data: { id: 2, html_url: 'url' } }
        },
        deleteComment: async (params) => {
          rejectIf('failDelete', params)
          calls.deleteComment.push(params)
          return { data: {} }
        }
      }
    }
  }
  return { github, calls }
}

test('codeownersComment posts normally without core', async () => {
  const { github, calls } = makeGithub()
  const comment = await codeownersComment({ context, github, matchResult, mode: 'always' })
  assert.equal(comment.id, 1)
  assert.equal(calls.createComment.length, 1)
})

test('codeownersComment survives fork 403 via job summary', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'summary-'))
  const file = path.join(dir, 'summary.md')
  const { github, calls } = makeGithub({ failCreate: true })
  const core = mockCore()
  const comment = await codeownersComment({
    context,
    github,
    matchResult,
    mode: 'always',
    core,
    _summaryEnv: { GITHUB_STEP_SUMMARY: file }
  })
  assert.equal(comment, null)
  assert.equal(calls.createComment.length, 0)
  assert.equal(core.warnings.length, 1)
  const summary = fs.readFileSync(file, 'utf-8')
  assert.ok(summary.includes('Code Owners Summary'))
  assert.ok(summary.includes('alice'))
  fs.rmSync(dir, { recursive: true, force: true })
})

test('codeownersComment still fails on 404', async () => {
  const { github } = makeGithub({ failCreate: true, failStatus: 404, failMessage: '404 Not Found' })
  await assert.rejects(
    codeownersComment({ context, github, matchResult, mode: 'always' }),
    /404 Not Found/
  )
})
