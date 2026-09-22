import assert from 'assert'
import fs from 'fs'
import { When, Then } from '@cucumber/cucumber'

function assertNoNetwork (cmd, label) {
  assert.ok(!cmd.includes('--connect-tcp'), `unexpected egress grant in ${label}:\n${cmd}`)
  assert.ok(!cmd.includes('--bind-tcp'), `unexpected bind grant in ${label}:\n${cmd}`)
  assert.ok(!cmd.includes('--unrestricted-network'), `unrestricted network in ${label}:\n${cmd}`)
}

Then('the opengrep command wraps opengrep with the sandbox wrapper', function () {
  const cmd = this.runners.opengrep.cmd
  assert.ok(cmd.includes('scripts/with-sandbox.sh'), `no wrapper in:\n${cmd}`)
  assert.ok(cmd.includes('-- opengrep '), `opengrep not the sandboxed command:\n${cmd}`)
  assert.ok(cmd.includes('--ro "$PWD"'), `workspace not read-only in:\n${cmd}`)
})

Then('the opengrep sandbox has no network access', function () {
  assertNoNetwork(this.runners.opengrep.cmd, 'opengrep')
})

Then('the opengrep command disables the version check and metrics', function () {
  const cmd = this.runners.opengrep.cmd
  assert.ok(cmd.includes('--disable-version-check'), `no version check opt-out in:\n${cmd}`)
  assert.ok(cmd.includes('SEMGREP_SEND_METRICS=off'), `metrics not disabled in:\n${cmd}`)
})

Then('the sveltegrep extraction commands write to a temp output directory', function () {
  const cmd = this.runners.sveltegrep.cmd
  const outputDirs = [...cmd.matchAll(/--output-dir\s+"?\$?SG_TMP"?/g)]
  assert.ok(outputDirs.length >= 2, `expected both extractions to use --output-dir, got ${outputDirs.length}:\n${cmd}`)
  assert.ok(cmd.includes('SG_TMP="$(mktemp -d'), `no temp dir creation:\n${cmd}`)
})

Then('the sveltegrep opengrep scan runs over the temp directory', function () {
  const cmd = this.runners.sveltegrep.cmd
  assert.ok(/--\s+opengrep /.test(cmd), `opengrep not wrapped:\n${cmd}`)
  assert.ok(cmd.includes(" '$SG_TMP'") || cmd.includes(' "$SG_TMP"'), `scan root not the temp dir:\n${cmd}`)
})

Then('the sveltegrep sandbox has no network access', function () {
  assertNoNetwork(this.runners.sveltegrep.cmd, 'sveltegrep')
})

Then('the sveltegrep temp directory is cleaned up after the scan', function () {
  const cmd = this.runners.sveltegrep.cmd
  assert.ok(/trap\s+'rm -rf "\$SG_TMP"'/.test(cmd), `no cleanup trap in:\n${cmd}`)
  assert.ok(!cmd.includes('-delete'), `extracted files should not be deleted from the workspace:\n${cmd}`)
})

Then('the safesvg command wraps xmllint with the sandbox wrapper', function () {
  const cmd = this.runners.safesvg.cmd
  assert.ok(cmd.includes('scripts/with-sandbox.sh'), `xmllint not wrapped:\n${cmd}`)
  assert.ok(cmd.includes('-- bash $SCRIPTPATH/xmllint.sh'), `xmllint not the sandboxed command:\n${cmd}`)
  assert.ok(cmd.includes('--ro "$PWD"'), `workspace not read-only in:\n${cmd}`)
})

Then('the safesvg sandbox has no network access', function () {
  assertNoNetwork(this.runners.safesvg.cmd, 'safesvg')
})

Then('the npm-audit command wraps python3 with the sandbox wrapper', function () {
  const cmd = this.runners['npm-audit'].cmd
  assert.ok(cmd.includes('scripts/with-sandbox.sh'), `no wrapper in:\n${cmd}`)
  assert.ok(cmd.includes('-- python3 $SCRIPTPATH/npm-audit.py'), `python3 not wrapped in:\n${cmd}`)
  assert.ok(!cmd.includes('--ro "$PWD"'), `whole workspace granted in:\n${cmd}`)
})

Then('the npm-audit sandbox grants only the changed package-lock.json files, not the workspace', function () {
  const cmd = this.runners['npm-audit'].cmd
  assert.ok(!cmd.includes('--ro "$PWD"'), `whole workspace granted in:\n${cmd}`)
  assert.ok(cmd.includes("tr '\\0' '\\n' < \"$SCRIPTPATH/all_changed_files.txt\""), `changed-file list not parsed in:\n${cmd}`)
  assert.ok(cmd.includes('case "${f' + '##*/}" in'), `basename filter missing in:\n${cmd}`)
  assert.ok(cmd.includes('package-lock.json) set -- "$@" --ro "$PWD/$f"'), `per-file lock grant missing in:\n${cmd}`)
  assert.ok(cmd.includes('--ro "$SCRIPTPATH"'), `changed-file list not readable in:\n${cmd}`)
})

Then('the npm-audit sandbox allows outbound TCP on port 443 only', function () {
  const cmd = this.runners['npm-audit'].cmd
  assert.ok(cmd.includes('--connect-tcp 443'), `no 443 egress in:\n${cmd}`)
  const grants = cmd.match(/--connect-tcp\s+\d+/g) || []
  for (const grant of grants) {
    assert.ok(grant.endsWith('443'), `unexpected egress grant ${grant} in:\n${cmd}`)
  }
  assertNoNetwork(cmd.replace(/--connect-tcp 443/g, ''), 'npm-audit')
})

When('the modelscan post comments script is loaded', function () {
  this.modelscanScript = fs.readFileSync('src/modelscanPostComments.js', 'utf-8')
})

Then('modelscan runs through the sandbox wrapper', function () {
  const src = this.modelscanScript
  assert.ok(src.includes('with-sandbox.sh'), 'modelscan spawn not wrapped')
  assert.ok(src.includes("'uv', 'run', '--frozen', '--no-sync'") || src.includes("'--no-sync'"), 'uv run --no-sync not preserved')
  assert.ok(src.includes('--ro'), `workspace not read-only in:\n${src.slice(0, 2000)}`)
})

Then('the modelscan sandbox has no network access', function () {
  const src = this.modelscanScript
  assert.ok(!src.includes('--connect-tcp'), 'modelscan must not have network access')
  assert.ok(!src.includes('--unrestricted-network'), 'modelscan must not have network access')
})
