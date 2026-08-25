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

When('checking unverified commits', async function () {
  this.github = this.makeMockGithub({
    pullCommits: this.commits || [],
    graphqlHandler: (query) => {
      if (query.includes('deleteIssueComment')) return { deleteIssueComment: { clientMutationId: null } }
      return { repository: { pullRequest: { comments: { nodes: this.existingComments || [] } } } }
    }
  })
  await this.attempt(() => unverifiedCommits({
    github: this.github,
    context: this.makeMockContext()
  }))
})

Then('the result is {string}', function (expected) {
  assert.equal(this.result, expected)
})

Then('the result is undefined', function () {
  assert.equal(this.result, undefined)
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
