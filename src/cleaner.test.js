import { strict as assert } from 'node:assert'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, '../assets')

function runCleaner (input) {
  const tmpFile = execSync('mktemp').toString().trim()
  execSync(`printf '%s' '${input.replace(/'/g, "'\\''")}' > ${tmpFile}`)
  const result = execSync(`/Users/kyle/.rvm/rubies/ruby-3.0.2/bin/ruby ${assetsDir}/cleaner.rb --opengrep --assignees < ${tmpFile}`, {
    env: { ...process.env, ASSIGNEES: '', SCRIPTPATH: assetsDir },
    encoding: 'utf-8'
  }).trim()
  execSync(`rm ${tmpFile}`)
  return result
}

console.log('Testing rule-based assignee PR comments via cleaner.rb...\n')

console.log('=== Test 1: android-profile-static (rule assignees: bridiver) ===\n')

const withAssignees = runCleaner(
  'E:/opengrep_rules/client/android-profile-static.java:2 Static methods to access the profile will become a problem when android allows multiple profiles.<br><br>Source: https://github.com/brave/security-action/blob/main/assets/opengrep_rules/client/android-profile-static.yaml<br><br><!-- Category: correctness -->,bridiver'
)
console.log(withAssignees + '\n')

assert.ok(withAssignees.includes('Cc @bridiver'), `Should Cc @bridiver, got: ${withAssignees}`)
assert.ok(!withAssignees.includes('@thypon'), `Should not include @thypon, got: ${withAssignees}`)
assert.ok(!withAssignees.includes('@kdenhartog'), `Should not include @kdenhartog, got: ${withAssignees}`)

console.log('=== Test 2: android-profile-original (rule assignees: bridiver) ===\n')

const withAssignees2 = runCleaner(
  'W:/opengrep_rules/client/android-profile-original.java:10 Getting the original profile explicitly can lead to security and privacy issues<br><br>Source: https://github.com/brave/security-action/blob/main/assets/opengrep_rules/client/android-profile-original.yaml<br><br><!-- Category: correctness -->,bridiver'
)
console.log(withAssignees2 + '\n')

assert.ok(withAssignees2.includes('Cc @bridiver'), `Should Cc @bridiver, got: ${withAssignees2}`)
assert.ok(!withAssignees2.includes('@thypon'), `Should not include @thypon, got: ${withAssignees2}`)
assert.ok(!withAssignees2.includes('@kdenhartog'), `Should not include @kdenhartog, got: ${withAssignees2}`)

console.log('=== Test 3: typos (no rule assignees) ===\n')

const noAssignees = runCleaner(
  'W:foo.c:5 The programmer accidentally uses the wrong operator, which changes the application logic in security-relevant ways.<br><br>Source: https://github.com/brave/security-action/blob/main/assets/opengrep_rules/client/typos.yaml<br><br><!-- Category: security -->,null'
)
console.log(noAssignees + '\n')

assert.ok(!noAssignees.includes('@thypon'), `Should not include @thypon, got: ${noAssignees}`)
assert.ok(!noAssignees.includes('@kdenhartog'), `Should not include @kdenhartog, got: ${noAssignees}`)
assert.ok(noAssignees.includes('Please consider an alternative approach'), `Should include self-service guidance, got: ${noAssignees}`)
assert.ok(noAssignees.includes('sec-team on slack'), `Should mention sec-team on slack, got: ${noAssignees}`)

console.log('✅ All tests passed!')
