import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import getConfig from '../../src/getConfig.js'
import getProperties from '../../src/getProperties.js'

Given('the repo has a config file {string} with content', function (path, table) {
  const config = {}
  for (const [key, value] of table.raw()) config[key] = value
  this.github = this.makeMockGithub({
    contentByPath: { [`${this.owner}/${this.repo}/${path}`]: config }
  })
})

Given('the repo has a broken config file {string}', function (path) {
  this.github = this.makeMockGithub({
    contentByPath: { [`${this.owner}/${this.repo}/${path}`]: '{not json' }
  })
})

When('fetching the config file {string}', async function (path) {
  await this.attempt(() => getConfig({
    owner: this.owner,
    repo: this.repo,
    path,
    github: this.github
  }))
})

Then('the config value for {string} is {string}', function (key, value) {
  assert.equal(this.result[key], value)
})

Then('the config is empty', function () {
  assert.deepEqual(this.result, {})
})

Given('the repo has properties', function (table) {
  const data = table.raw().map(row => ({ property_name: row[0], value: row[1] }))
  this.github = this.makeMockGithub({
    requestHandler: (route) => {
      if (route.includes('properties/values')) return { data }
      throw new Error('unexpected request ' + route)
    }
  })
})

Given('the repo properties request fails', function () {
  this.github = this.makeMockGithub({
    requestHandler: () => { throw new Error('properties down') }
  })
})

When('fetching the repo properties', async function () {
  await this.attempt(() => getProperties({
    owner: this.owner,
    repo: this.repo,
    github: this.github
  }))
})

When('fetching the repo properties with prefix {string}', async function (prefix) {
  await this.attempt(() => getProperties({
    owner: this.owner,
    repo: this.repo,
    github: this.github,
    prefix
  }))
})

Then('the property {string} is {string}', function (name, value) {
  assert.equal(this.result[name], value)
})

Then('the property {string} is undefined', function (name) {
  assert.equal(name in this.result, false)
})
