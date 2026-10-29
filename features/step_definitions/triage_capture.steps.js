import { Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'

// ${RUNNER_TEMP:-/tmp} literal, assembled to appease no-template-curly-in-string
const RT = '$' + '{RUNNER_TEMP:-/tmp}'

Then('the opengrep cmd tees raw json to {string}', function (relPath) {
  const cmd = this.runners.opengrep.cmd
  assert.ok(
    cmd.includes(`| tee "${RT}/${relPath}"`),
    `opengrep cmd should tee raw json to ${relPath}`
  )
})

Then('the sveltegrep cmd tees raw json to {string}', function (relPath) {
  const cmd = this.runners.sveltegrep.cmd
  assert.ok(
    cmd.includes(`| tee "${RT}/${relPath}"`),
    `sveltegrep cmd should tee raw json to ${relPath}`
  )
})

Then('the opengrep cmd ensures the capture directory exists', function () {
  assert.ok(this.runners.opengrep.cmd.includes(`mkdir -p "$HOME/.semgrep" "$HOME/.cache/opengrep" "${RT}/security-action"`), 'opengrep cmd should mkdir the capture dir')
})

Then('the sveltegrep cmd ensures the capture directory exists', function () {
  assert.ok(this.runners.sveltegrep.cmd.includes(`mkdir -p "$HOME/.semgrep" "$HOME/.cache/opengrep" "${RT}/security-action"`), 'sveltegrep cmd should mkdir the capture dir')
})

Then('both runner cmds derive the capture path from RUNNER_TEMP with a tmp fallback', function () {
  for (const name of ['opengrep', 'sveltegrep']) {
    assert.ok(this.runners[name].cmd.includes(RT), `${name} cmd should use RUNNER_TEMP with tmp fallback`)
  }
})
