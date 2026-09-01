import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import reconcileNudgeMessages from '../../src/reconcileNudgeMessages.js'

function makeAlert (n) {
  return {
    number: n,
    html_url: `https://github.com/brave/app/dependabot/${n}`,
    severity: 'high',
    dependency: { package: { name: `pkg-${n}` } },
    security_advisory: {
      summary: `advisory ${n}`,
      cve_id: `CVE-2026-00${n}`,
      ghsa_id: `GHSA-00${n}`
    },
    security_vulnerability: { first_patched_version: { identifier: '1.2.3' } }
  }
}

Given('the reconcile runs on {iso-date}', function (date) {
  this.reconcileNow = date
})

Given('the repo {string} has {int} open alerts', function (repo, count) {
  this.reconcileRepo = repo
  this.reconcileAlerts = Array.from({ length: count }, (_, i) => makeAlert(i + 1))
})

When('reconciling nudge messages', async function () {
  const refreshCalls = []
  const repo = this.reconcileRepo || 'brave/app'
  const listSlackMessageRepos = async () => [repo]
  const deleteSlackMessages = async () => {}
  this.github = this.github || this.makeMockGithub({
    alertsByRepo: { [repo]: this.reconcileAlerts || [] }
  })
  await this.attempt(() => reconcileNudgeMessages({
    github: this.github,
    slackToken: 'xoxb-test',
    channel: 'C001',
    now: this.reconcileNow,
    listSlackMessageRepos,
    deleteSlackMessages,
    refreshNudgeThread: async (args) => { refreshCalls.push(args) }
  }))
  this.refreshCalls = refreshCalls
})

Then('the reconcile alert severity filter is {string}', function (expected) {
  const paginate = this.github.__recorder.find('paginate')
    .find(call => call.params.url.includes('dependabot/alerts'))
  assert.ok(paginate, 'expected a dependabot alerts paginate call')
  assert.deepEqual(paginate.params.opts.severity, expected.split(','))
})
