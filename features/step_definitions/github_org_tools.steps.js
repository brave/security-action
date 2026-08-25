import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import getMaintainers from '../../src/getMaintainers.js'
import updateRuntimeProperty from '../../src/updateRuntimeProperty.js'
import addMaintainerCustomProperty from '../../src/addMaintainerCustomProperty.js'

function requestPatches (github) {
  return github.__recorder.find('request')
    .filter(call => call.params.route === 'PATCH /orgs/{org}/properties/values')
    .map(call => call.params.params)
}

Given('the org has repo properties', function (table) {
  const propertyRepos = table.raw().map(row => ({
    repository_name: row[0],
    properties: row[1] ? [{ property_name: 'maintainers', value: row[1] }] : []
  }))
  this.github = this.makeMockGithub({ propertyRepos })
})

When('listing maintainers', async function () {
  await this.attempt(() => getMaintainers({ org: this.org, github: this.github }))
})

When('listing maintainers without a github client', async function () {
  await this.attempt(() => getMaintainers({ org: this.org }))
})

Then('the maintainers output is', function (table) {
  const expected = table.raw().map(row => row[0])
  const actual = this.result.trim().split('\n')
  assert.deepEqual(actual, expected)
})

Given('repositories {string} and {string}', function (a, b) {
  this.repositories = [a, b].map(full => {
    const [org, name] = full.split('/')
    return { org, name }
  })
})

Given('repositories {string}', function (a) {
  this.repositories = [{
    org: a.split('/')[0],
    name: a.split('/')[1]
  }]
})

When('updating the runtime property to {string}', async function (runtime) {
  this.github = this.makeMockGithub({})
  await this.attempt(() => updateRuntimeProperty({
    github: this.github,
    repositories: this.repositories,
    runtime,
    org: this.org
  }))
})

When('updating the runtime property to {string} from a string', async function (runtime) {
  this.github = this.makeMockGithub({})
  const repos = this.repositories.map(r => `${r.org}/${r.name}`).join(' ')
  await this.attempt(() => updateRuntimeProperty({
    github: this.github,
    repositories: repos,
    runtime,
    org: this.org
  }))
})

When('updating the runtime property to {string} with a core object', async function (runtime) {
  this.github = this.makeMockGithub({})
  this.core = this.makeMockCore()
  await this.attempt(() => updateRuntimeProperty({
    github: this.github,
    repositories: this.repositories,
    runtime,
    org: this.org,
    core: this.core
  }))
})

When('updating the runtime property without runtime', async function () {
  this.github = this.makeMockGithub({})
  await this.attempt(() => updateRuntimeProperty({
    github: this.github,
    repositories: [{ org: this.org, name: 'one' }],
    org: this.org
  }))
})

When('updating the runtime property without repositories', async function () {
  this.github = this.makeMockGithub({})
  await this.attempt(() => updateRuntimeProperty({
    github: this.github,
    runtime: 'node',
    org: this.org
  }))
})

When('updating the runtime property without org', async function () {
  this.github = this.makeMockGithub({})
  await this.attempt(() => updateRuntimeProperty({
    github: this.github,
    repositories: [{ org: this.org, name: 'one' }],
    runtime: 'node'
  }))
})

Then('the runtime property is patched for {int} repositories', function (count) {
  assert.equal(requestPatches(this.github).length, count)
})

Then('the runtime property is patched for {int} repository', function (count) {
  assert.equal(requestPatches(this.github).length, count)
})

Then('the patched runtime value is {string}', function (runtime) {
  for (const params of requestPatches(this.github)) {
    assert.equal(params.properties[0].property_name, 'runtime')
    assert.equal(params.properties[0].value, runtime)
  }
})

Then('core setSecret was called for {string} and {string}', function (org, name) {
  const secrets = this.core.__recorder.paramsOf('setSecret').map(p => p.value)
  assert.ok(secrets.includes(org), `expected ${org} in ${secrets}`)
  assert.ok(secrets.includes(name), `expected ${name} in ${secrets}`)
})

function orgRepos (names, flags = {}) {
  return names.map(name => ({
    name,
    private: false,
    archived: false,
    disabled: false,
    fork: false,
    size: 100,
    default_branch: 'main',
    ...flags
  }))
}

Given('org members {string}, {string} and {string}', function (a, b, c) {
  this.orgMembers = [a, b, c].map(login => ({ login }))
})

Given('org members {string}', function (a) {
  this.orgMembers = [a].map(login => ({ login }))
})

Given('the org has public repos {string} and {string}', function (a, b) {
  this.reposList = orgRepos([a, b])
})

Given('the org has public repos {string}', function (a) {
  this.reposList = orgRepos([a])
})

Given('the org has private repos {string}', function (a) {
  this.reposList = orgRepos([a], { private: true })
})

Given('the ignored maintainers are {string}', function (ignored) {
  this.ignoreMaintainers = ignored.split(',')
})

Given('the scanned repositories are {string}', function (skipped) {
  this.skipRepositories = skipped.split(',')
})

Given(/repo "(.*)" has contributors/, function (repo, table) {
  this.contributorsByRepo = this.contributorsByRepo || {}
  this.contributorsByRepo[`${this.org}/${repo}`] = table.raw().map(([login, contributions]) => ({
    login,
    contributions: Number(contributions)
  }))
})

Given(/repo "(.*)" has commits by/, function (repo, table) {
  this.commitsByRepo = this.commitsByRepo || {}
  const commits = []
  for (const [author, count] of table.raw()) {
    for (let i = 0; i < Number(count); i++) commits.push({ author: { login: author } })
  }
  this.commitsByRepo[`${this.org}/${repo}`] = commits
})

function buildGithub (this_) {
  this_.github = this_.makeMockGithub({
    reposList: this_.reposList,
    orgMembers: this_.orgMembers,
    contributorsByRepo: this_.contributorsByRepo || {},
    commitsByRepo: this_.commitsByRepo || {}
  })
}

When('adding the maintainer property in simple scan mode', async function () {
  buildGithub(this)
  await this.attempt(() => addMaintainerCustomProperty({
    org: this.org,
    github: this.github,
    simpleScan: true,
    ignoreMaintainers: this.ignoreMaintainers || [],
    skipRepositories: this.skipRepositories || ['chromium'],
    debug: false
  }))
})

When('adding the maintainer property in commit scan mode', async function () {
  buildGithub(this)
  await this.attempt(() => addMaintainerCustomProperty({
    org: this.org,
    github: this.github,
    simpleScan: false,
    ignoreMaintainers: this.ignoreMaintainers || [],
    skipRepositories: this.skipRepositories || ['chromium'],
    debug: false
  }))
})

When('adding the maintainer property without a github client', async function () {
  await this.attempt(() => addMaintainerCustomProperty({ org: this.org }))
})

Then('the maintainers property is set for repo {string} to {string}', function (repo, value) {
  const patches = requestPatches(this.github).filter(p => p.repository_names[0] === repo)
  assert.equal(patches.length, 1, `expected one patch for ${repo}`)
  assert.equal(patches[0].properties[0].property_name, 'maintainers')
  assert.equal(patches[0].properties[0].value, value)
})

Then('the maintainers property is not set for repo {string}', function (repo) {
  const patches = requestPatches(this.github).filter(p => p.repository_names[0] === repo)
  assert.equal(patches.length, 0)
})

Then('no maintainer property is set', function () {
  assert.equal(requestPatches(this.github).length, 0)
})

Then('the output lists repo {string} as needing archival', function (repo) {
  assert.ok(this.result.includes(`https://github.com/${this.org}/${repo} `),
    `expected ${repo} in ${this.result}`)
  assert.ok(this.result.includes('The following repositories should be archived'))
})

Then('the output is empty', function () {
  assert.equal(this.result, '')
})
