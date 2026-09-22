import assert from 'assert'
import fs from 'fs'
import * as yaml from 'js-yaml'
import { When, Then } from '@cucumber/cucumber'

function loadRunners (world) {
  const doc = yaml.load(fs.readFileSync('assets/reviewdog/reviewdog.yml', 'utf-8'))
  return doc.runner
}

When('the reviewdog configuration is loaded', function () {
  this.runners = loadRunners(this)
})

Then('the pip-audit command wraps python3 with the sandbox wrapper', function () {
  const cmd = this.runners['pip-audit'].cmd
  assert.ok(cmd.includes('scripts/with-sandbox.sh'), `missing wrapper in:\n${cmd}`)
  assert.ok(cmd.includes('-- python3 $SCRIPTPATH/pip-audit.py'), `python3 not wrapped in:\n${cmd}`)
})

Then('the pip-audit sandbox grants write access only to the venv temp directory', function () {
  const cmd = this.runners['pip-audit'].cmd
  assert.ok(cmd.includes('--ro "$PWD"'), `workspace not read-only in:\n${cmd}`)
  assert.ok(cmd.includes('--rwx "$PIP_TMP"'), `venv temp dir not writable+executable in:\n${cmd}`)
  const writeGrants = [...cmd.matchAll(/--rw(x)?\s+\S+/g)].map(m => m[0])
  for (const grant of writeGrants) {
    // /dev/null is a device node git opens O_RDWR for its pager plumbing.
    assert.ok(grant.includes('$PIP_TMP') || grant.includes('/dev/null'), `unexpected write grant ${grant} in:\n${cmd}`)
  }
})

Then('the pip-audit sandbox allows outbound TCP on port 443 only', function () {
  const cmd = this.runners['pip-audit'].cmd
  assert.ok(cmd.includes('--connect-tcp 443'), `no 443 egress in:\n${cmd}`)
  const grants = cmd.match(/--connect-tcp\s+\d+/g) || []
  for (const grant of grants) {
    assert.ok(grant.endsWith('443'), `unexpected egress grant ${grant} in:\n${cmd}`)
  }
  assert.ok(!cmd.includes('--bind-tcp'), `unexpected bind grant in:\n${cmd}`)
  assert.ok(!cmd.includes('--unrestricted-network'), `unrestricted network in:\n${cmd}`)
})

Then('the pip-audit sandbox allows the action venv and toolchain read+execute', function () {
  const cmd = this.runners['pip-audit'].cmd
  assert.ok(cmd.includes('ACTION_ROOT="$(dirname "$SCRIPTPATH")"'), `no action root in:\n${cmd}`)
  assert.ok(cmd.includes('--rox "$ACTION_ROOT/.venv"'), `venv not executable in:\n${cmd}`)
  assert.ok(cmd.includes('--rox /opt/hostedtoolcache'), `setup-python toolchain not executable in:\n${cmd}`)
  // uv-managed pythons: the action venv python is a symlink into
  // uv-managed python dir — exec of the target must be granted; setup-uv
  // overrides the location via UV_PYTHON_INSTALL_DIR.
  assert.ok(cmd.includes('--rox "${UV_PYTHON_INSTALL_DIR:-$HOME' + '/.local/share/uv}"'), `uv-managed python dir not executable in:\n${cmd}`)
  // /run — resolv.conf is a symlink into /run on runners; DNS breaks without it.
  assert.ok(cmd.includes('--ro /run'), `/run not readable in:\n${cmd}`)
})

Then('the pip-audit sandbox scrubs the environment', function () {
  const cmd = this.runners['pip-audit'].cmd
  assert.ok(cmd.includes('SANDBOX_CLEAN_ENV=1'), `no env scrub in:\n${cmd}`)
})
