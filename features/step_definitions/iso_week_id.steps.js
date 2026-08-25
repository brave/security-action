import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import isoWeekId from '../../src/isoWeekId.js'

Given('the date {iso-date}', function (date) {
  this.date = date
})

When('the ISO week id is computed', function () {
  this.result = isoWeekId(this.date)
})

When('the ISO week id is computed at 23:59:59.999', function () {
  this.result = isoWeekId(new Date(this.date.getTime() + 23 * 3600000 + 59 * 60000 + 59999))
})

Then('the week id is {string}', function (expected) {
  assert.equal(this.result, expected)
})

Then('the week id is well-formed', function () {
  assert.match(this.result, /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/)
})
