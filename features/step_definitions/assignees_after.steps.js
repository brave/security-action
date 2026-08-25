import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import assigneesAfter from '../../src/steps/assigneesAfter.js'

function unescapeBody (body) {
  return body.replace(/\\n/g, '\n')
}

function buildGithub (world) {
  return world.makeMockGithub({
    graphqlHandler: () => ({
      repository: { pullRequest: { reviewThreads: { nodes: world.reviewThreads || [] } } }
    })
  })
}

Given('a review thread comment by {string} with body {string}', function (author, body) {
  this.reviewThreads = [...(this.reviewThreads || []), {
    comments: { nodes: [{ id: `c-${this.reviewThreads?.length || 0}`, author: { login: author }, body: unescapeBody(body) }] }
  }]
})

When('resolving assignees after review with fallback {string}', async function (fallback) {
  this.github = buildGithub(this)
  await this.attempt(() => assigneesAfter({
    github: this.github,
    context: this.makeMockContext(),
    assignees: fallback
  }))
})

When('resolving assignees for PR {string} with fallback {string}', async function (number, fallback) {
  this.github = buildGithub(this)
  await this.attempt(() => assigneesAfter({
    github: this.github,
    context: this.makeMockContext(),
    number,
    assignees: fallback
  }))
})

Then('the assignees are {string}', function (expected) {
  assert.equal(this.result, expected.replace(/\\n/g, '\n'))
})
