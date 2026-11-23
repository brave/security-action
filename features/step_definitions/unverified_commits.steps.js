import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import unverifiedCommits from '../../src/steps/unverifiedCommits.js'

const COMMENT_PREFIX = 'The following commits were not [verified](https://github.com/brave/handbook/blob/master/development/commit-and-tag-signing.md):\n'

Given('a commit {string} with verification reason {string}', function (sha, reason) {
  this.commits = [...(this.commits || []), {
    sha,
    commit: { verification: { verified: false, reason } }
  }]
})

Given('a commit {string} verified', function (sha) {
  this.commits = [...(this.commits || []), {
    sha,
    commit: { verification: { verified: true, reason: 'valid' } }
  }]
})

Given('an existing notice comment {string} listing {string}', function (id, listing) {
  this.existingComments = [...(this.existingComments || []), {
    id,
    author: { login: 'github-actions' },
    body: COMMENT_PREFIX + listing
  }]
})

Given('an existing notice comment {string} by {string} listing {string}', function (id, author, listing) {
  this.existingComments = [...(this.existingComments || []), {
    id,
    author: { login: author },
    body: COMMENT_PREFIX + listing
  }]
})

Given('the issue has label {string}', function (name) {
  this.issueLabels = [...(this.issueLabels || []), name]
})

Given('adding labels fails with {string}', function (message) {
  this.labelWriteFailure = { op: 'add', message, status: 403 }
})

Given('removing labels fails with {string}', function (message) {
  this.labelWriteFailure = { op: 'remove', message, status: 403 }
})

When('checking unverified commits', async function () {
  this.core = this.makeMockCore()
  const failure = this.labelWriteFailure
  const labels = this.issueLabels || []
  this.github = this.makeMockGithub({
    pullCommits: this.commits || [],
    graphqlHandler: (query) => {
      if (query.includes('deleteIssueComment')) return { deleteIssueComment: { clientMutationId: null } }
      return { repository: { pullRequest: { comments: { nodes: this.existingComments || [] } } } }
    },
    extend: (github, rec) => {
      github.rest.issues.listLabelsOnIssue = async (params) => {
        rec.record('issues.listLabelsOnIssue', params)
        return { data: labels.map(name => ({ name })) }
      }
      const httpError = (status, message) => Object.assign(new Error(message), { status })
      github.rest.issues.addLabels = async (params) => {
        rec.record('issues.addLabels', params)
        if (failure && failure.op === 'add') throw httpError(failure.status, failure.message)
        return { data: {} }
      }
      github.rest.issues.removeLabel = async (params) => {
        rec.record('issues.removeLabel', params)
        if (failure && failure.op === 'remove') throw httpError(failure.status, failure.message)
        if (!labels.includes(params.name)) {
          throw httpError(404, 'Label does not exist')
        }
        return { status: 200 }
      }
    }
  })
  await this.attempt(() => unverifiedCommits({
    github: this.github,
    context: this.makeMockContext(),
    core: this.core
  }))
})

Then('the result is {string}', function (expected) {
  assert.equal(this.result, expected)
})

Then('a notice comment is posted listing {string}', function (listing) {
  const created = this.github.__recorder.paramsOf('issues.createComment')[0]
  assert.ok(created, 'expected a notice comment')
  assert.ok(created.body.includes(listing), `${created.body} lacks "${listing}"`)
})

Then('no notice comment is posted', function () {
  assert.equal(this.github.__recorder.count('issues.createComment'), 0)
})

Then('the notice comment {string} is deleted', function (id) {
  const mutations = this.github.__recorder.find('graphql')
    .filter(call => call.params.query.includes('deleteIssueComment'))
    .map(call => call.params.variables.comment)
  assert.ok(mutations.includes(id), `expected ${id} to be deleted, got: ${mutations.join(', ')}`)
})

Then('no notice comment is deleted', function () {
  const mutations = this.github.__recorder.find('graphql')
    .filter(call => call.params.query.includes('deleteIssueComment'))
  assert.equal(mutations.length, 0)
})

Then('the label {string} is added', function (name) {
  const calls = this.github.__recorder.paramsOf('issues.addLabels')
  assert.equal(calls.length, 1, `expected one addLabels call, got ${calls.length}`)
  assert.ok(calls[0].labels.includes(name), `addLabels params lack "${name}": ${JSON.stringify(calls[0])}`)
})

Then('the label {string} is removed', function (name) {
  const calls = this.github.__recorder.paramsOf('issues.removeLabel')
  assert.ok(calls.some(params => params.name === name), `expected removeLabel("${name}"), got: ${JSON.stringify(calls)}`)
})

Then('no label writes happen', function () {
  assert.equal(this.github.__recorder.count('issues.addLabels'), 0)
  assert.equal(this.github.__recorder.count('issues.removeLabel'), 0)
})

Then('a warning is logged containing {string}', function (text) {
  const warnings = this.core.__recorder.find('warning').map(call => call.params.msg)
  assert.ok(warnings.some(msg => msg.includes(text)), `no warning containing "${text}", got: ${JSON.stringify(warnings)}`)
})
