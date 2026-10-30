import { Given, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const RULE_DIRS = ['client', 'services']

function loadRules () {
  const byId = new Map()
  for (const dir of RULE_DIRS) {
    const root = path.join('assets/opengrep_rules', dir)
    for (const f of fs.readdirSync(root)) {
      if (!f.endsWith('.yaml') || f.includes('.test.')) continue
      const doc = yaml.load(fs.readFileSync(path.join(root, f), 'utf8'))
      for (const r of doc?.rules ?? []) byId.set(r.id, r)
    }
  }
  return byId
}

Given('the opengrep ruleset', function () {
  if (!this.params.rulesById) this.params.rulesById = loadRules()
})

function cweText (rule) {
  const cwe = rule?.metadata?.cwe
  if (cwe === undefined) return ''
  return (Array.isArray(cwe) ? cwe : [cwe]).join(';')
}

Then('rule {string} declares cwe {string}', function (ruleId, expected) {
  const rule = this.params.rulesById.get(ruleId)
  assert.ok(rule, `rule ${ruleId} not found`)
  assert.ok(cweText(rule).includes(expected), `rule ${ruleId} cwe=${cweText(rule)} expected ${expected}`)
})

Then('rule {string} declares no cwe', function (ruleId) {
  const rule = this.params.rulesById.get(ruleId)
  assert.ok(rule, `rule ${ruleId} not found`)
  assert.equal(cweText(rule), '', `rule ${ruleId} unexpectedly has cwe=${cweText(rule)}`)
})

Then('every rule with cwe metadata has a well-formed CWE id', function () {
  for (const [id, rule] of this.params.rulesById) {
    for (const entry of Array.isArray(rule?.metadata?.cwe) ? rule.metadata.cwe : (rule?.metadata?.cwe ? [rule.metadata.cwe] : [])) {
      assert.match(String(entry), /CWE-\d+/, `rule ${id} has malformed cwe entry: ${entry}`)
    }
  }
})
