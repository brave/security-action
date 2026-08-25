import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import assigneeRemoved from '../../src/steps/assigneeRemoved.js'

Given('the PR timeline contains unlabeled events', function (table) {
  const nodes = table.raw().map(([label, actor]) => ({
    label: { name: label },
    actor: { login: actor }
  }))
  this.github = this.makeMockGithub({
    graphqlHandler: () => ({
      repository: { pullRequest: { timelineItems: { nodes } } }
    })
  })
})

When('checking with assignees {string}', async function (assignees) {
  await this.attempt(() => assigneeRemoved({
    context: this.makeMockContext(),
    github: this.github,
    assignees
  }))
})

Then('the security review was removed by an assignee', function () {
  assert.equal(this.result, true)
})

Then('the security review was not removed by an assignee', function () {
  assert.equal(this.result, false)
})
