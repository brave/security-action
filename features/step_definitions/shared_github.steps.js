import { Given, Then } from '@cucumber/cucumber'
import assert from 'assert'

Given('org {string}', function (org) {
  this.org = org
})

Given('a GitHub client for org {string} repo {string}', function (owner, repo) {
  this.owner = owner
  this.repo = repo
  this.github = this.makeMockGithub({})
})

Then('the action fails with {string}', function (message) {
  assert.ok(this.error, 'expected the action to fail')
  assert.equal(this.error.message, message)
})
