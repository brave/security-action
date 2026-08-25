import { Given, When, Then } from '@cucumber/cucumber'
import { strict as assert } from 'assert'
import { fileURLToPath } from 'url'
import dependabotNudge, {
  buildRepoMessage,
  buildParentText,
  buildCcLine,
  buildParentBlocks,
  parentCcLine
} from '../../src/dependabotNudge.js'

const ACTION_PATH = fileURLToPath(new URL('../..', import.meta.url))

function makeAlert (n, severity = 'high', summary = `Vulnerability ${n}`) {
  return {
    number: n,
    html_url: `https://github.com/brave/foo/security/dependabot/${n}`,
    severity,
    dependency: { package: { name: `pkg-${n}` }, scope: 'runtime' },
    security_advisory: {
      summary,
      description: `# Title\n\nBad things in pkg-${n}.\n`,
      severity,
      cve_id: `CVE-2026-000${n}`,
      ghsa_id: `GHSA-000${n}`
    },
    security_vulnerability: {
      first_patched_version: { identifier: '1.2.3' }
    }
  }
}

async function withCappedTimers (fn) {
  const orig = globalThis.setTimeout
  globalThis.setTimeout = (cb, ms) => orig(cb, Math.min(ms, 1))
  try {
    return await fn()
  } finally {
    globalThis.setTimeout = orig
  }
}

Given('the org {string}', function (org) {
  this.org = org
  this.alertsByRepo = {}
  this.propertiesByRepo = {}
  this.contentByPath = {}
  this.githubToSlack = {}
})

Given('the repository {string}', function (repoFullName) {
  this.repos = [...(this.repos || []), {
    name: repoFullName.split('/')[1],
    archived: false,
    disabled: false
  }]
})

Given('the archived repository {string}', function (repoFullName) {
  this.repos = [...(this.repos || []), {
    name: repoFullName.split('/')[1],
    archived: true,
    disabled: false
  }]
})

Given('the disabled repository {string}', function (repoFullName) {
  this.repos = [...(this.repos || []), {
    name: repoFullName.split('/')[1],
    archived: false,
    disabled: true
  }]
})

Given('repo {string} has {int} alerts', addAlerts)
Given('repo {string} has {int} alert', addAlerts)

function addAlerts (name, count) {
  const key = `${this.org}/${name}`
  const start = this.alertsByRepo[key]?.length || 0
  this.alertsByRepo[key] = [
    ...(this.alertsByRepo[key] || []),
    ...Array.from({ length: count }, (_, i) => makeAlert(start + i + 1))
  ]
}

Given('repo {string} has an alert with severity {string}', function (name, severity) {
  const key = `${this.org}/${name}`
  const n = (this.alertsByRepo[key]?.length || 0) + 1
  this.alertsByRepo[key] = [...(this.alertsByRepo[key] || []), makeAlert(n, severity)]
})

Given('repo {string} has an alert with summary {string}', function (name, summary) {
  const key = `${this.org}/${name}`
  const n = (this.alertsByRepo[key]?.length || 0) + 1
  this.alertsByRepo[key] = [...(this.alertsByRepo[key] || []), makeAlert(n, 'high', summary)]
})

Given('repo {string} has an alert without a patched version', function (name) {
  const key = `${this.org}/${name}`
  const n = (this.alertsByRepo[key]?.length || 0) + 1
  this.alertsByRepo[key] = [
    ...(this.alertsByRepo[key] || []),
    { ...makeAlert(n), security_vulnerability: {} }
  ]
})

Given('repo {string} has maintainers {string}', function (name, maintainers) {
  const key = `${this.org}/${name}`
  this.propertiesByRepo[key] = [
    ...(this.propertiesByRepo[key] || []),
    { property_name: 'security_action_maintainers', value: maintainers }
  ]
})

Given('repo {string} has the security-action config', function (name, docstring) {
  const key = `${this.org}/${name}`
  this.contentByPath[`${key}/.github/security-action.json`] = JSON.parse(docstring)
})

Given('the GitHub-to-Slack user map', function (rows) {
  for (const [github, slack] of rows.raw()) {
    this.githubToSlack[github] = slack
  }
})

Given('the skipped repositories {string}', function (skipRepositories) {
  this.skipRepositories = skipRepositories
})

Given('assigning maintainers is disabled', function () {
  this.assignMaintainers = false
})

Given('alert assignment fails', function () {
  this.assignmentFails = true
})

Given('repo {string} fails to list alerts', function (name) {
  this.alertFailures = new Set([...(this.alertFailures || []), name])
})

Given('the single output message mode', function () {
  this.singleOutputMessage = true
})

When('running the dependabot nudge', async function () {
  const requestHandler = (route, params) => {
    if (route.includes('properties/values')) {
      const key = `${params.owner}/${params.repo}`
      return { data: this.propertiesByRepo[key] || [] }
    }
    if (route.includes('dependabot/alerts')) {
      if (this.assignmentFails) throw new Error('assignment failed')
      return { status: 204, data: {} }
    }
    return { status: 204, data: {} }
  }
  const github = this.makeMockGithub({
    reposList: this.repos || [],
    alertsByRepo: this.alertsByRepo || {},
    contentByPath: this.contentByPath || {},
    requestHandler,
    extend: (gh) => {
      const origPaginate = gh.paginate
      gh.paginate = async (url, opts = {}) => {
        if (this.alertFailures?.has(opts.repo)) {
          throw new Error('failed to list alerts')
        }
        return origPaginate(url, opts)
      }
    }
  })
  this.github = github
  await this.attempt(() => withCappedTimers(() => dependabotNudge({
    org: this.org,
    github,
    skipRepositories: this.skipRepositories,
    githubToSlack: this.githubToSlack,
    singleOutputMessage: this.singleOutputMessage === true,
    assignMaintainers: this.assignMaintainers !== false,
    actionPath: ACTION_PATH
  })))
})

When('building the parent text for repo {string} with {int} total and {int} critical', function (repo, total, critical) {
  this.parentText = buildParentText({ repo, total, critical })
})

When('building the repo message for {int} alerts', function (count) {
  const alerts = Array.from({ length: count }, (_, i) => makeAlert(i + 1))
  alerts[alerts.length - 1] = makeAlert(count, 'critical')
  this.repoMessage = buildRepoMessage({ alerts })
})

When('building the repo message for an alert with a missing top-level severity', function () {
  this.repoMessage = buildRepoMessage({
    alerts: [{ ...makeAlert(1, 'critical'), severity: undefined }]
  })
})

When('building the cc line for maintainers', function (rows) {
  this.ccLine = buildCcLine(rows.raw().map(r => r[0]))
})

When('building the cc line with no maintainers and default contact', function (rows) {
  this.ccLine = buildCcLine([], rows.raw().map(r => r[0]))
})

When('building the parent blocks for repo {string} with {int} total and {int} critical and cc {string}', async function (repo, total, critical, cc) {
  this.parentBlocks = await buildParentBlocks({ repo, total, critical, cc })
})

When('reading the parent cc line from blocks', function (rows) {
  const blocks = rows.raw().map(([text]) => ({
    type: 'section',
    text: { type: 'mrkdwn', text }
  }))
  this.ccLine = parentCcLine(blocks)
})

Then('the result is an empty message list', function () {
  assert.ok(Array.isArray(this.result), 'result must be an array')
  assert.equal(this.result.length, 0)
})

Then('the result has {int} message', function (count) {
  assert.ok(Array.isArray(this.result), 'result must be an array')
  assert.equal(this.result.length, count)
})

Then('the message for {string} totals {int} alerts with {int} critical', function (name, total, critical) {
  const message = this.result.find(m => m.repo === `${this.org}/${name}`)
  assert.ok(message, `no message for ${this.org}/${name}`)
  assert.equal(message.total, total)
  assert.equal(message.critical, critical)
})

Then('the message for {string} contains {string}', function (name, text) {
  const message = this.result.find(m => m.repo === `${this.org}/${name}`)
  assert.ok(message, `no message for ${this.org}/${name}`)
  assert.ok(message.message.includes(text), `expected message to contain ${text}`)
})

Then('the message for {string} has cc line {string}', function (name, cc) {
  const message = this.result.find(m => m.repo === `${this.org}/${name}`)
  assert.ok(message, `no message for ${this.org}/${name}`)
  assert.equal(message.cc, cc)
})

Then('each alert is assigned to {string}', function (assignees) {
  const patches = this.github.__recorder.find('request')
    .filter(call => call.params.route.includes('dependabot/alerts'))
  assert.equal(patches.length, Object.values(this.alertsByRepo).flat().length)
  for (const call of patches) {
    assert.deepEqual(call.params.params.assignees, assignees.split(','))
  }
})

Then('no alert assignment is requested', function () {
  const patches = this.github.__recorder.find('request')
    .filter(call => call.params.route.includes('dependabot/alerts'))
  assert.equal(patches.length, 0)
})

Then('the result is a single message string', function () {
  assert.equal(typeof this.result, 'string')
})

Then('the single message contains {string}', function (text) {
  assert.ok(
    this.result.includes(text),
    `expected single message to contain ${JSON.stringify(text)}`
  )
})

Then('the parent text is {string}', function (text) {
  assert.equal(this.parentText, text)
})

Then('the repo message totals {int} alerts with {int} critical', function (total, critical) {
  assert.equal(this.repoMessage.total, total)
  assert.equal(this.repoMessage.critical, critical)
})

Then('the repo message contains {string}', function (text) {
  assert.ok(this.repoMessage.message.includes(text))
})

Then('the repo message does not contain {string}', function (text) {
  assert.ok(!this.repoMessage.message.includes(text))
})

Then('the cc line is {string}', function (text) {
  assert.equal(this.ccLine, text)
})

Then('the cc line starts with {string}', function (text) {
  assert.ok(this.ccLine.startsWith(text), `cc line: ${this.ccLine}`)
})

Then('the parent blocks have {int} section', function (count) {
  const sections = this.parentBlocks.filter(b => b.type === 'section')
  assert.equal(sections.length, count)
})

Then('the parent blocks section contains {string}', function (text) {
  const sections = this.parentBlocks.filter(b => b.type === 'section')
  assert.ok(sections[0].text.text.includes(text), `section: ${sections[0].text.text}`)
})

Then('the parent blocks section ends with {string}', function (text) {
  const sections = this.parentBlocks.filter(b => b.type === 'section')
  assert.ok(sections[0].text.text.endsWith(text), `section: ${sections[0].text.text}`)
})

Then('the parent blocks do not contain {string}', function (text) {
  assert.ok(!JSON.stringify(this.parentBlocks).includes(text))
})

Then('the parent cc line is {string}', function (text) {
  const cc = this.parentBlocks ? parentCcLine(this.parentBlocks) : this.ccLine
  assert.equal(cc, text)
})
