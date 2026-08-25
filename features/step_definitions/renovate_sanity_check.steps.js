import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import renovateSanityCheck from '../../src/renovateSanityCheck.js'

function repo (name, flags = {}) {
  return {
    name,
    archived: false,
    disabled: false,
    fork: false,
    size: 100,
    default_branch: 'main',
    ...flags
  }
}

function activeGithub (this_, reposList, contentByPath = {}) {
  this_.reposList = reposList
  this_.github = this_.makeMockGithub({ reposList, contentByPath })
}

Given('the org has active repos {string}', function (name) {
  activeGithub(this, [repo(name)])
})

Given('the org has active repos {string} and {string}', function (a, b) {
  activeGithub(this, [repo(a), repo(b)])
})

Given('the org has archived, disabled and forked repos {string}', function (name) {
  activeGithub(this, [
    repo(`${name}-archived`, { archived: true }),
    repo(`${name}-disabled`, { disabled: true }),
    repo(`${name}-fork`, { fork: true })
  ])
})

Given('repo {string} is an empty repository', function (name) {
  this.reposList = this.reposList.map(r => r.name === name ? repo(name, { size: 0 }) : r)
  activeGithub(this, this.reposList)
})

Given('repo {string} has a renovate config extending {string}', function (name, preset) {
  this.contentByPath = this.contentByPath || {}
  this.contentByPath[`${this.org}/${name}/renovate.json`] = { extends: [preset] }
  activeGithub(this, this.reposList, this.contentByPath)
})

Given('repo {string} has a JSON5 renovate config extending {string}', function (name, preset) {
  this.contentByPath = this.contentByPath || {}
  this.contentByPath[`${this.org}/${name}/renovate.json5`] =
    `// company preset\n{ extends: ['${preset}'] }`
  activeGithub(this, this.reposList, this.contentByPath)
})

Given('repo {string} has a package.json with a renovate section extending {string}', function (name, preset) {
  this.contentByPath = this.contentByPath || {}
  this.contentByPath[`${this.org}/${name}/package.json`] = {
    name,
    renovate: { extends: [preset] }
  }
  activeGithub(this, this.reposList, this.contentByPath)
})

Given('the skipped repositories are {string}', function (skipped) {
  this.skipRepositories = skipped.split(',')
})

When('running the renovate sanity check', async function () {
  this.github = this.github || this.makeMockGithub({ reposList: this.reposList || [] })
  await this.attempt(() => renovateSanityCheck({
    org: this.org,
    github: this.github,
    skipRepositories: this.skipRepositories || ['chromium', 'renovate-config'],
    debug: false
  }))
})

When('running the renovate sanity check without a github client', async function () {
  await this.attempt(() => renovateSanityCheck({ org: this.org }))
})

Then('the check reports no problems', function () {
  assert.equal(this.result, undefined)
})

Then('the check reports {string}', function (text) {
  assert.ok(this.result.includes(text), `${this.result} lacks ${text}`)
})
