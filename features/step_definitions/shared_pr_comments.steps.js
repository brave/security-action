import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import cleanupComments from '../../src/steps/cleanupComments.js'
import commentsNumber from '../../src/steps/commentsNumber.js'

function unescapeBody (body) {
  return body.replace(/\\n/g, '\n')
}

Given('an outdated review thread comment {string} by {string} with body {string}', function (id, author, body) {
  this.threads = [...(this.threads || []), {
    isOutdated: true,
    comments: { totalCount: 1, nodes: [{ id, author: { login: author }, body: unescapeBody(body) }] }
  }]
})

Given('an outdated review thread comment {string} by {string} with body {string} with {int} comments', function (id, author, body, totalCount) {
  this.threads = [...(this.threads || []), {
    isOutdated: true,
    comments: { totalCount, nodes: [{ id, author: { login: author }, body: unescapeBody(body) }] }
  }]
})

Given('a current review thread comment {string} by {string} with body {string}', function (id, author, body) {
  this.threads = [...(this.threads || []), {
    isOutdated: false,
    comments: { totalCount: 1, nodes: [{ id, author: { login: author }, body: unescapeBody(body) }] }
  }]
})

Given('a current review thread comment {string} by {string} with body {string} with {int} comments', function (id, author, body, totalCount) {
  this.threads = [...(this.threads || []), {
    isOutdated: false,
    comments: { totalCount, nodes: [{ id, author: { login: author }, body: unescapeBody(body) }] }
  }]
})

When('cleaning up comments', async function () {
  this.github = this.makeMockGithub({
    graphqlHandler: (query) => {
      if (query.includes('deletePullRequestReviewComment')) return { deletePullRequestReviewComment: { clientMutationId: null } }
      return { repository: { pullRequest: { reviewThreads: { nodes: this.threads || [] } } } }
    }
  })
  await this.attempt(() => cleanupComments({
    github: this.github,
    context: this.makeMockContext()
  }))
})

When('counting Cc comments', async function () {
  this.github = this.makeMockGithub({
    graphqlHandler: () => ({
      repository: { pullRequest: { reviewThreads: { nodes: this.threads || [] } } }
    })
  })
  await this.attempt(() => commentsNumber({
    github: this.github,
    context: this.makeMockContext()
  }))
})

Then('the comment {string} is deleted', function (id) {
  const mutations = this.github.__recorder.find('graphql')
    .filter(call => call.params.query.includes('deletePullRequestReviewComment'))
    .map(call => call.params.variables.comment)
  assert.ok(mutations.includes(id), `expected ${id} to be deleted, got: ${mutations.join(', ')}`)
})

Then('no comment is deleted', function () {
  const mutations = this.github.__recorder.find('graphql')
    .filter(call => call.params.query.includes('deletePullRequestReviewComment'))
  assert.equal(mutations.length, 0)
})

Then('the count is {int}', function (count) {
  assert.equal(this.result.number, count)
})

Then('the categories are {string}', function (categories) {
  const expected = categories === '' ? [] : categories.split(',').sort()
  const actual = this.result.categories.map(c => c.trim()).sort()
  assert.deepEqual(actual, expected)
})
