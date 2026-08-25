import { Given, Then } from '@cucumber/cucumber'
import assert from 'assert'
import {
  DEFAULT_SKIP_HOTWORDS,
  Severity,
  nudgeSeverityForToday,
  severityKeysAbove
} from '../../src/dependabotConstants.js'

Then('the severity order is {string}', function (expected) {
  assert.equal(Object.keys(Severity).join(','), expected)
})

Given('the minimum level {string}', function (level) {
  this.level = level
})

Given('the minimum numeric level {int}', function (level) {
  this.level = level
})

Then('the keys at or above are {string}', function (expected) {
  const keys = severityKeysAbove(this.level).join(',')
  assert.equal(keys, expected)
})

Given('today is {iso-date}', function (date) {
  this.today = date
})

Then('the nudge severity for today is {string}', function (expected) {
  assert.equal(nudgeSeverityForToday(this.today), expected)
})

Then('the default skip hotwords include {string} and {string}', function (a, b) {
  assert.ok(DEFAULT_SKIP_HOTWORDS.includes(a), `expected ${a}`)
  assert.ok(DEFAULT_SKIP_HOTWORDS.includes(b), `expected ${b}`)
})
