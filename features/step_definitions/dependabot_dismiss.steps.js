import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import dependabotDismiss from '../../src/dependabotDismiss.js'

function dismissPatches (github) {
  return github.__recorder.find('request')
    .filter(call => call.params.route.startsWith('PATCH /repos/'))
    .map(call => call.params.params)
}

Given('the org has open dependabot alerts', function (table) {
  this.orgAlerts = table.raw().map(row => {
    const [number, summary, ghsaId, fourth, fifth] = row
    const cveId = fifth ? fourth : null
    const repo = fifth || fourth
    return {
      number: Number(number),
      html_url: `https://github.com/${this.org}/${repo}/dependabot/alert/${number}`,
      repository: { name: repo },
      security_advisory: {
        summary,
        ghsa_id: ghsaId,
        cve_id: cveId
      }
    }
  })
  this.github = this.makeMockGithub({ orgAlerts: this.orgAlerts })
})

Given('a dismiss list file containing {string} and {string}', function (idA, idB) {
  this.dismissConfig = path.join(os.tmpdir(), `dismiss-list-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`)
  fs.writeFileSync(this.dismissConfig, `${idA}\n${idB}\n`)
})

When('dismissing alerts', async function () {
  this.github = this.github || this.makeMockGithub({ orgAlerts: [] })
  const config = this.dismissConfig || path.join(os.tmpdir(), 'nonexistent-dismiss-list.txt')
  await this.attempt(() => dependabotDismiss({
    org: this.org,
    github: this.github,
    dependabotDismissConfig: config
  }))
})

When('dismissing alerts in debug mode', async function () {
  this.github = this.github || this.makeMockGithub({ orgAlerts: [] })
  const config = this.dismissConfig || path.join(os.tmpdir(), 'nonexistent-dismiss-list.txt')
  await this.attempt(() => dependabotDismiss({
    org: this.org,
    github: this.github,
    dependabotDismissConfig: config,
    debug: true
  }))
})

When('dismissing alerts with minlevel {string}', async function (minlevel) {
  this.github = this.github || this.makeMockGithub({ orgAlerts: [] })
  const config = this.dismissConfig || path.join(os.tmpdir(), 'nonexistent-dismiss-list.txt')
  await this.attempt(() => dependabotDismiss({
    org: this.org,
    github: this.github,
    dependabotDismissConfig: config,
    minlevel
  }))
})

When('dismissing alerts with a missing dismiss list', async function () {
  await this.attempt(() => dependabotDismiss({
    org: this.org,
    github: this.github,
    dependabotDismissConfig: path.join(os.tmpdir(), 'nonexistent-dismiss-list.txt')
  }))
})

Then('{int} alerts are dismissed', function (count) {
  assert.equal(dismissPatches(this.github).length, count)
})

Then('{int} alert is dismissed', function (count) {
  assert.equal(dismissPatches(this.github).length, count)
})

Then('the dismissed comment for alert {int} contains the hotword {string}', function (number, hotword) {
  const patch = dismissPatches(this.github).find(p => p.alert_number === number)
  assert.ok(patch, `no dismissal for alert ${number}`)
  assert.ok(patch.dismissed_comment.includes(`hotword "${hotword}"`),
    `${patch.dismissed_comment} lacks hotword ${hotword}`)
})

Then('the dismissed comment for alert {int} contains the id {string}', function (number, id) {
  const patch = dismissPatches(this.github).find(p => p.alert_number === number)
  assert.ok(patch, `no dismissal for alert ${number}`)
  assert.ok(patch.dismissed_comment.includes(`matched the id "${id}"`),
    `${patch.dismissed_comment} lacks id ${id}`)
})

Then('the dismissal message is empty', function () {
  assert.equal(this.result.message, '')
})

Then('the dismissal message contains {string}', function (text) {
  assert.ok(this.result.message.includes(text), `${this.result.message} lacks ${text}`)
})

Then('the dismissed repos are {string}', function (repos) {
  assert.deepEqual(this.result.dismissedRepos, repos.split(','))
})

Then('no repositories are in the dismissed list', function () {
  assert.deepEqual(this.result.dismissedRepos, [])
})

Then('the paginate severity filter is {string}', function (severities) {
  const paginate = this.github.__recorder.find('paginate')[0]
  assert.ok(paginate, 'expected a paginate call')
  assert.deepEqual(paginate.params.opts.severity, severities.split(','))
})
