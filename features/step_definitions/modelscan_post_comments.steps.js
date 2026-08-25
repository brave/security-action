import { Given, When, Then } from '@cucumber/cucumber'
import { strict as assert } from 'assert'
import path from 'path'
import { fileURLToPath } from 'url'
import modelscanPostComments from '../../src/modelscanPostComments.js'

const ACTION_PATH = fileURLToPath(new URL('../..', import.meta.url))

Given('the repository {string} with pull request {int}', function (repo, number) {
  const [owner, name] = repo.split('/')
  this.context = this.makeMockContext({
    repo: { owner, repo: name },
    issue: { number }
  })
})

Given('the modelscan assignees {string}', function (assignees) {
  this.assignees = assignees
})

Given('a modelscan run with no output', function () {
  this.spawnResult = { stdout: '', stderr: '' }
})

Given('a modelscan run that outputs', function (docstring) {
  this.spawnResult = { stdout: docstring + '\n', stderr: '' }
})

Given('a modelscan run with {int} findings', function (count) {
  const lines = []
  for (let i = 0; i < count; i++) {
    lines.push(JSON.stringify({
      path: `model${i}.pkl`,
      severity: 'LOW',
      description: `finding ${i}`,
      module: 'os',
      operator: 'system',
      scanner: 'pickle'
    }))
  }
  this.spawnResult = { stdout: lines.join('\n') + '\n', stderr: '' }
})

Given('a modelscan run that exits with status {int} and outputs', function (status, docstring) {
  this.spawnResult = { status, stdout: docstring + '\n', stderr: 'ERROR: boom' }
})

Given('a modelscan run that fails to spawn', function () {
  this.spawnResult = { error: new Error('spawn uv ENOENT'), stdout: '', stderr: '' }
})

Given('an existing modelscan comment on {string}', function (filePath) {
  this.threads = [
    ...(this.threads || []),
    {
      isOutdated: false,
      path: filePath,
      comments: {
        totalCount: 1,
        nodes: [{
          author: { login: 'github-actions' },
          body: '<!-- modelscan -->\n<!-- Category: security -->'
        }]
      }
    }
  ]
})

Given('an outdated modelscan comment on {string}', function (filePath) {
  this.threads = [
    ...(this.threads || []),
    {
      isOutdated: true,
      path: filePath,
      comments: {
        totalCount: 1,
        nodes: [{
          author: { login: 'github-actions' },
          body: '<!-- modelscan -->\n<!-- Category: security -->'
        }]
      }
    }
  ]
})

Given('an existing comment on {string} by {string}', function (filePath, author) {
  this.threads = [
    ...(this.threads || []),
    {
      isOutdated: false,
      path: filePath,
      comments: {
        totalCount: 1,
        nodes: [{
          author: { login: author },
          body: '<!-- modelscan -->\n<!-- Category: security -->'
        }]
      }
    }
  ]
})

Given('posting comments fails with status {int} {string}', function (status, message) {
  this.createReviewCommentError = { status, message }
})

When('posting modelscan comments', async function () {
  const threads = this.threads || []
  const graphqlBody = {
    repository: {
      pullRequest: {
        reviewThreads: { nodes: threads }
      }
    }
  }
  const github = this.makeMockGithub({
    graphqlBody,
    pullHeadSha: 'abc1234',
    extend: (gh) => {
      if (this.createReviewCommentError) {
        const err = new Error(this.createReviewCommentError.message)
        err.status = this.createReviewCommentError.status
        gh.rest.pulls.createReviewComment = async () => { throw err }
      }
    }
  })
  this.github = github
  this.spawn = this.makeMockSpawn(this.spawnResult)
  await this.attempt(() => modelscanPostComments({
    github,
    context: this.context,
    actionPath: ACTION_PATH,
    assignees: this.assignees,
    debug: false,
    _spawn: this.spawn
  }))
})

Then('no GitHub API call is made', function () {
  assert.equal(this.github.__recorder.calls.length, 0)
})

Then('a review comment is posted on {string}', function (filePath) {
  const comments = this.github.__recorder.paramsOf('createReviewComment')
  assert.equal(comments.length, 1, `expected one comment, got ${comments.length}`)
  const params = comments[0]
  assert.equal(params.path, filePath)
  assert.equal(params.subject_type, 'file')
  assert.equal(params.side, 'RIGHT')
})

Then('{int} review comments are posted', function (count) {
  assert.equal(this.github.__recorder.count('createReviewComment'), count)
})

Then('no review comment is posted', function () {
  assert.equal(this.github.__recorder.count('createReviewComment'), 0)
})

Then('the comment is anchored to the pull request head', function () {
  const params = this.github.__recorder.paramsOf('createReviewComment')[0]
  assert.equal(params.commit_id, 'abc1234')
  assert.equal(params.pull_number, 42)
})

Then('the modelscan comment body contains {string}', function (text) {
  const params = this.github.__recorder.paramsOf('createReviewComment')[0]
  assert.ok(
    params.body.includes(text),
    `body should contain ${JSON.stringify(text)}, got:\n${params.body}`
  )
})

Then('the modelscan comment body does not contain {string}', function (text) {
  const params = this.github.__recorder.paramsOf('createReviewComment')[0]
  assert.ok(
    !params.body.includes(text),
    `body should not contain ${JSON.stringify(text)}, got:\n${params.body}`
  )
})

Then('the posting does not fail', function () {
  assert.equal(this.error, null)
})

Then('the audit is spawned via uv', function () {
  const calls = this.spawn.__recorder.paramsOf('spawn')
  assert.equal(calls.length, 1)
  const [cmd, args] = calls[0].args
  assert.equal(cmd, 'uv')
  assert.ok(args.includes('run'), 'uv run required')
  assert.ok(args.includes('--project'), 'uv run --project required')
  assert.ok(
    args.some(a => String(a).endsWith('modelscan-audit.py')),
    'audit script must be in args'
  )
})

Then('the audit SCRIPTPATH points at the assets directory', function () {
  const [, , opts] = this.spawn.__recorder.paramsOf('spawn')[0].args
  assert.equal(opts.env.SCRIPTPATH, path.join(ACTION_PATH, 'assets'))
})

Then('the audit runs in the workspace directory', function () {
  const [, , opts] = this.spawn.__recorder.paramsOf('spawn')[0].args
  assert.equal(opts.cwd, undefined)
})
