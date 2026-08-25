import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'assert'
import modelscanDependencyGroups from '../../src/modelscanDependencyGroups.js'

Given('modelscan is enabled with {string}', function (enabled) {
  this.modelscanEnabled = enabled
})

Given('the environment has no SEC_ACTION_MODELSCAN_HEAVY', function () {
  this.env = {}
})

Given('the environment has SEC_ACTION_MODELSCAN_HEAVY set to {word}', function (value) {
  this.env = { SEC_ACTION_MODELSCAN_HEAVY: value }
})

When('computing groups for changed files', function (table) {
  const changedFiles = table.raw().map(row => row[0])
  this.result = modelscanDependencyGroups({
    changedFiles,
    modelscanEnabled: this.modelscanEnabled,
    env: this.env
  })
})

When('computing groups for the changed file {string}', function (file) {
  this.result = modelscanDependencyGroups({
    changedFiles: [file],
    modelscanEnabled: this.modelscanEnabled,
    env: this.env
  })
})

When('computing groups for no changed files', function () {
  this.result = modelscanDependencyGroups({
    changedFiles: [],
    modelscanEnabled: this.modelscanEnabled,
    env: this.env
  })
})

Then('the groups are {string}', function (groups) {
  const expected = groups ? groups.split(',') : []
  assert.deepEqual(this.result, expected)
})
