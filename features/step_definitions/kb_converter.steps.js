import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { load } from 'js-yaml'
import { convertRule, convertTree, loadDocs } from '../../scripts/kb/opengrep-to-kb.mjs'

const RULES_ROOT = path.resolve('assets/opengrep_rules')

function frontmatter (md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/)
  assert.ok(m, 'frontmatter missing')
  const fm = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (kv) fm[kv[1]] = kv[2].replace(/^\[|\]$/g, '')
  }
  return fm
}

function section (md, start) {
  const idx = md.indexOf(start)
  assert.ok(idx >= 0, `section "${start}" missing`)
  const after = md.slice(idx + start.length)
  const m = after.match(/\n(?:#{1,3} .+|\*\*[A-Z][a-z]+\.\*\*)/)
  return m ? after.slice(0, m.index + 1) : after
}

function fenceBlock (sectionText, tag) {
  const idx = sectionText.indexOf(`${tag}:`)
  assert.ok(idx >= 0, `block "${tag}:" missing`)
  const m = sectionText.slice(idx).match(/```\w*\n([\s\S]*?)```/)
  assert.ok(m, `code fence after "${tag}:" missing`)
  return m[1]
}

Given('an opengrep rule {string} from {string} with:', function (id, source, yamlText) {
  const doc = load(yamlText)
  this.params.rule = { ...doc.rules[0], id }
  this.params.source = source
  this.params.raw = yamlText
})

Given('opengrep rules from {string}:', function (source, yamlText) {
  this.params.raw = yamlText
  this.params.source = source
})

Given('the real opengrep ruleset with dirs {string}', function (dirs) {
  this.params.dirs = dirs.split(',')
  this.params.out = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-out-'))
})

When('the rule is converted', function () {
  this.result = convertRule(this.params.rule, this.params.source)
})

When('the ruleset is converted to a knowledge-base tree', function () {
  const docs = this.params.dirs
    ? loadDocs({ rulesRoot: RULES_ROOT, dirs: this.params.dirs })
    : [{ dir: this.params.source.split('/')[0], file: this.params.source.split('/')[1], raw: this.params.raw }]
  this.params.files = convertTree({ docs, out: this.params.out })
})

Then('the markdown frontmatter has name {string} rubric {string} severity {string} and languages {string}', function (name, rubric, severity, languages) {
  const fm = frontmatter(this.result)
  assert.equal(fm.name, name)
  assert.equal(fm.rubric, rubric)
  assert.equal(fm.severity, severity)
  assert.equal(fm.languages, languages)
})

Then('the Rule section quotes the message {string}', function (msg) {
  const s = section(this.result, '**Rule.**')
  assert.ok(s.includes(msg), `Rule section missing "${msg}":\n${s}`)
})

Then('the Why section mentions {string}', function (text) {
  const s = section(this.result, '**Why.**')
  assert.ok(s.includes(text), `Why section missing "${text}"`)
})

Then('the Examples section has a {word} block with {string}', function (tag, snippet) {
  const block = fenceBlock(section(this.result, '## Examples'), tag)
  assert.ok(block.includes(snippet), `${tag} block missing "${snippet}":\n${block}`)
})

Then('the Detection hints section contains the literal pattern {string}', function (pattern) {
  const s = section(this.result, '## Detection hints')
  assert.ok(s.includes(pattern), `Detection hints missing "${pattern}"`)
})

Then('the COMMON_METADATA for {string} has path expression {string} listing rule {string}', function (kbDir, regex, ruleName) {
  assertCommonMetadataGroup(this, kbDir, regex, ruleName)
})

Then('the COMMON_METADATA for {string} has a catch-all path expression {string} listing rule {string}', function (kbDir, regex, ruleName) {
  assertCommonMetadataGroup(this, kbDir, regex, ruleName)
})

function assertCommonMetadataGroup (world, kbDir, regex, ruleName) {
  const md = world.params.files.get(`${kbDir}/COMMON_METADATA`)
  assert.ok(md, `COMMON_METADATA missing for ${kbDir}`)
  const groupIdx = md.indexOf(`path_expression: "${regex}"`)
  assert.ok(groupIdx >= 0, `no group with path_expression "${regex}" in:\n${md}`)
  assert.ok(md.slice(groupIdx).includes(`rules: "rules/${ruleName}.md"`), `group does not list ${ruleName}`)
}

Then('every rule yields a markdown file with a non-empty Rule section', function () {
  let ruleCount = 0
  const seen = new Set()
  for (const [p, md] of this.params.files) {
    if (p.endsWith('COMMON_METADATA')) continue
    ruleCount++
    assert.ok(p.endsWith('.md'), `${p} not markdown`)
    assert.match(md, /\*\*Rule\.\*\* +\S/)
    const fm = frontmatter(md)
    assert.ok(fm.name && fm.rubric && fm.severity, `${p} incomplete frontmatter`)
    assert.ok(!seen.has(fm.name), `duplicate name ${fm.name}`)
    seen.add(fm.name)
  }
  assert.ok(ruleCount > 600, `expected ~681 files, got ${ruleCount}`)
})

Then('every kb dir has a COMMON_METADATA file', function () {
  for (const kbDir of this.params.dirs) {
    const name = kbDir.split('/').length > 1 ? kbDir.split('/').pop() : kbDir
    assert.ok(this.params.files.get(`${name}/COMMON_METADATA`), `COMMON_METADATA missing for ${name}`)
  }
})
