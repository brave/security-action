import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import codeownersComment from '../../src/steps/codeownersComment.js'

const COMMENT_IDENTIFIER = '<!-- security-action:codeowners-summary -->'

function filesFor (count) {
  return Array.from({ length: count }, (_, i) => `src/file${i}.js`)
}

Given('a PR with {int} changed files owned by {string}', function (count, owner) {
  const files = filesFor(count)
  this.matchResult = {
    ownersToFiles: { [owner]: files },
    stats: {
      totalFiles: count,
      filesWithOwners: count,
      uniqueOwners: 1,
      teams: 0,
      teamsList: [],
      individuals: 1,
      individualsList: [owner]
    }
  }
})

Given('a PR with {int} changed files without owners', function (count) {
  this.matchResult = {
    ownersToFiles: {},
    stats: {
      totalFiles: count,
      filesWithOwners: 0,
      uniqueOwners: 0,
      teams: 0,
      teamsList: [],
      individuals: 0,
      individualsList: []
    }
  }
})

Given('a PR with {int} changed files owned by team {string} and individual {string}', function (count, team, individual) {
  const files = filesFor(count)
  const half = Math.floor(count / 2)
  this.matchResult = {
    ownersToFiles: {
      [`@${team}`]: files.slice(0, half),
      [individual]: files.slice(half)
    },
    stats: {
      totalFiles: count,
      filesWithOwners: count,
      uniqueOwners: 2,
      teams: 1,
      teamsList: [`@${team}`],
      individuals: 1,
      individualsList: [individual]
    }
  }
})

Given('an existing codeowners comment {string}', function (id) {
  this.commentsList = [...(this.commentsList || []), {
    id: Number(id),
    author: { login: 'github-actions' },
    body: COMMENT_IDENTIFIER + '\nold body'
  }]
})

Given('octokit rejects comment writes with {int} {string}', function (status, message) {
  this.rejectWrites = { status, message }
  // Job summary fallback target for skipped comment writes.
  this.prevStepSummaryEnv = process.env.GITHUB_STEP_SUMMARY
  this.summaryFile = path.join(os.tmpdir(), `summary-${process.pid}-${crypto.randomUUID()}.md`)
  fs.writeFileSync(this.summaryFile, '')
  process.env.GITHUB_STEP_SUMMARY = this.summaryFile
})

When('posting the codeowners comment', async function () {
  await postComment.call(this, {})
})

When('posting the codeowners comment in mode {string}', async function (mode) {
  await postComment.call(this, { mode })
})

When('posting the codeowners comment in mode {string} with a threshold of {int}', async function (mode, minFiles) {
  await postComment.call(this, { mode, minFiles })
})

async function postComment ({ mode, minFiles }) {
  const reject = this.rejectWrites
  this.github = this.makeMockGithub({
    commentsList: this.commentsList,
    ...(reject && {
      extend: (github) => {
        const forbidden = async (params) => {
          throw Object.assign(new Error(reject.message), { status: reject.status })
        }
        github.rest.issues.createComment = forbidden
        github.rest.issues.updateComment = forbidden
      }
    })
  })
  this.core = this.makeMockCore()
  await this.attempt(() => codeownersComment({
    context: this.makeMockContext(),
    github: this.github,
    core: this.core,
    matchResult: this.matchResult,
    ...(mode !== undefined && { mode }),
    ...(minFiles !== undefined && { minFiles })
  }))
}

function lastCommentBody () {
  const created = this.github.__recorder.paramsOf('issues.createComment')
  const updated = this.github.__recorder.paramsOf('issues.updateComment')
  const all = [...created, ...updated]
  assert.ok(all.length > 0, 'expected a comment to be created or updated')
  return all[all.length - 1].body
}

Then('a new comment is created', function () {
  assert.equal(this.github.__recorder.count('issues.createComment'), 1)
  assert.equal(this.github.__recorder.count('issues.updateComment'), 0)
})

Then('no new comment is created', function () {
  assert.equal(this.github.__recorder.count('issues.createComment'), 0)
})

Then('the comment {string} is updated', function (id) {
  const updates = this.github.__recorder.paramsOf('issues.updateComment')
  assert.equal(updates.length, 1)
  assert.equal(updates[0].comment_id, Number(id))
})

Then('the codeowners comment {string} is deleted', function (id) {
  const deletes = this.github.__recorder.paramsOf('issues.deleteComment')
  assert.ok(
    deletes.some(params => params.comment_id === Number(id)),
    `expected comment ${id} to be deleted`
  )
})

Then('the comment body contains {string}', function (text) {
  const body = lastCommentBody.call(this)
  assert.ok(body.includes(text), `comment body lacks "${text}"`)
})

Then('the comment body contains a diff anchor for {string}', function (file) {
  const hash = crypto.createHash('sha256').update(file).digest('hex')
  const body = lastCommentBody.call(this)
  assert.ok(body.includes(`#diff-${hash}`), 'comment body lacks diff anchor')
})

Then('the comment body is under 65536 characters', function () {
  const body = lastCommentBody.call(this)
  assert.ok(body.length < 65536, `comment body has ${body.length} chars`)
})

Then('a warning is logged that the token is read-only', function () {
  const warnings = this.core.__recorder.paramsOf('warning')
  assert.equal(warnings.length, 1, `expected one warning, got ${warnings.length}`)
  assert.match(warnings[0].msg, /read-only/)
})

Then('the comment body is written to the job summary', function () {
  assert.ok(this.summaryFile, 'expected a job summary file')
  const text = fs.readFileSync(this.summaryFile, 'utf-8')
  assert.ok(text.includes(COMMENT_IDENTIFIER), 'job summary lacks the comment body')
  assert.ok(text.includes('alice'), 'job summary lacks the owners')
  assert.ok(text.includes('read-only token on fork PR'), 'job summary lacks the skip note')
})
