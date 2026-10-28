import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { parseVerdict } from '../../src/triage/verdict.js'

Given('the verdict payload:', function (payload) {
  this.params.payload = payload
})

When('the verdict is parsed', function () {
  this.params.parsed = parseVerdict(this.params.payload)
})

When('the verdict is parsed with case_id {string} and agent {string}', function (caseId, agent) {
  this.params.parsed = parseVerdict(this.params.payload, { caseId, agent })
})

Then('the verdict is valid', function () {
  assert.equal(this.params.parsed.ok, true, `expected valid verdict, got error: ${this.params.parsed.error}`)
})

Then('the verdict is invalid with reason {string}', function (error) {
  assert.equal(this.params.parsed.ok, false)
  assert.ok(String(this.params.parsed.error).includes(error), `error ${this.params.parsed.error} should include ${error}`)
})

Then('the verdict label is {string}', function (label) {
  assert.equal(this.params.parsed.verdict.label, label)
})

Then('the verdict confidence is {string}', function (confidence) {
  assert.equal(this.params.parsed.verdict.confidence, confidence)
})

Then('the verdict confidence score is {float}', function (score) {
  assert.equal(this.params.parsed.verdict.confidence_score, score)
})

Then('the verdict has {int} evidence item(s?)', function (count) {
  assert.equal(this.params.parsed.verdict.evidence.length, count)
})

Then('the verdict case_id is {string}', function (caseId) {
  assert.equal(this.params.parsed.verdict.case_id, caseId)
})

Then('the verdict agent is {string}', function (agent) {
  assert.equal(this.params.parsed.verdict.agent, agent)
})
