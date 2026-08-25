import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import hotwords from '../../src/steps/hotwords.js'

function unescapeText (text) {
  return text.replace(/\\n/g, '\n')
}

function graphqlResponse (world, query) {
  if (query.includes('comments(first: 100)')) {
    return { repository: { pullRequest: { comments: { nodes: world.existingComments || [] } } } }
  }
  return { repository: { pullRequest: { title: world.prTitle, body: world.prBody } } }
}

Given('the PR title {string} and body {string}', function (title, body) {
  this.prTitle = title
  this.prBody = body
})

Given('the hotwords {string}', function (hotwordsInput) {
  this.hotwordsInput = unescapeText(hotwordsInput)
})

Given('the monitoring comment is already posted', async function () {
  const captureGithub = this.makeMockGithub({
    graphqlHandler: (query) => graphqlResponse(this, query)
  })
  await hotwords({
    github: captureGithub,
    context: this.makeMockContext(),
    hotwords: this.hotwordsInput
  })
  const posted = captureGithub.__recorder.paramsOf('issues.createComment')[0]?.body
  this.existingComments = [{ author: { login: 'github-actions' }, body: posted }]
})

When('checking hotwords', async function () {
  this.github = this.makeMockGithub({
    graphqlHandler: (query) => graphqlResponse(this, query)
  })
  await this.attempt(() => hotwords({
    github: this.github,
    context: this.makeMockContext(),
    hotwords: this.hotwordsInput
  }))
})

Then('a hotword hit is reported', function () {
  assert.equal(this.result, true)
})

Then('no hotword hit is reported', function () {
  assert.equal(this.result, false)
})

Then('a monitoring comment is posted', function () {
  assert.equal(this.github.__recorder.count('issues.createComment'), 1)
})

Then('no monitoring comment is posted', function () {
  assert.equal(this.github.__recorder.count('issues.createComment'), 0)
})

Then('the monitoring comment mentions {string}', function (text) {
  const created = this.github.__recorder.paramsOf('issues.createComment')[0]
  assert.ok(created, 'expected a monitoring comment')
  assert.ok(created.body.includes(text), `${created.body} lacks "${text}"`)
})
