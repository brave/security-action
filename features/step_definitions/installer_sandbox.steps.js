import assert from 'assert'
import fs from 'fs'
import * as yaml from 'js-yaml'
import { Given, When, Then } from '@cucumber/cucumber'
import buildUvSyncCmd from '../../src/uvSyncSandbox.js'

function loadActionYml () {
  return yaml.load(fs.readFileSync('actions/main/action.yml', 'utf-8'))
}

function loadLintYml () {
  return yaml.load(fs.readFileSync('.github/workflows/lint.yml', 'utf-8'))
}

function assertTcp443Only (cmd, label) {
  assert.ok(cmd.includes('--connect-tcp 443'), `no 443 egress in ${label}:\n${cmd}`)
  const grants = cmd.match(/--connect-tcp\s+\d+/g) || []
  for (const grant of grants) {
    assert.ok(grant.endsWith('443'), `unexpected egress grant ${grant} in ${label}:\n${cmd}`)
  }
  assert.ok(!cmd.includes('--bind-tcp'), `unexpected bind grant in ${label}:\n${cmd}`)
  assert.ok(!cmd.includes('--unrestricted-network'), `unrestricted network in ${label}:\n${cmd}`)
}

When('the main action workflow is loaded', function () {
  this.actionDoc = loadActionYml()
})

When('the lint workflow is loaded', function () {
  this.lintDoc = loadLintYml()
})

When('the main action script is loaded', function () {
  this.actionScript = fs.readFileSync('actions/main/action.cjs', 'utf-8')
})

Then('a step imports the landrun installer', function () {
  const steps = this.actionDoc.runs.steps
  const step = steps.find(s => s.uses && s.uses.startsWith('actions/github-script') &&
    typeof s.with.script === 'string' && s.with.script.includes('src/installLandrun.js'))
  assert.ok(step, 'no step imports src/installLandrun.js')
  this.landrunStep = step
})

Then('that step runs before the pnpm install step', function () {
  const steps = this.actionDoc.runs.steps
  const landrunIdx = steps.indexOf(this.landrunStep)
  const pnpmIdx = steps.findIndex(s => s.run && s.run.includes('pnpm install'))
  assert.ok(pnpmIdx !== -1, 'no pnpm install step found')
  assert.ok(landrunIdx < pnpmIdx, `landrun step (${landrunIdx}) must run before pnpm install (${pnpmIdx})`)
})

Then('no step uses ruby setup with bundler cache', function () {
  const steps = this.actionDoc.runs.steps
  const rubyStep = steps.find(s => s.uses && s.uses.startsWith('ruby/setup-ruby'))
  assert.ok(!rubyStep, 'ruby/setup-ruby step still present')
  const bundleYml = JSON.stringify(this.actionDoc)
  assert.ok(!bundleYml.includes('bundler-cache'), 'bundler-cache still configured')
})

Then('the pnpm install step wraps the install with the sandbox wrapper', function () {
  const steps = this.actionDoc.runs.steps
  const step = steps.find(s => s.run && s.run.includes('pnpm install'))
  assert.ok(step, 'no pnpm install step found')
  assert.ok(step.run.includes('scripts/with-sandbox.sh'), `install not wrapped:\n${step.run}`)
  assert.ok(/--\s+(corepack )?pnpm install --frozen-lockfile( -C)?/.test(step.run), `pnpm not the sandboxed command:\n${step.run}`)
  this.pnpmStep = step
})

Then('the pnpm sandbox grants write access only to node modules caches and temp paths', function () {
  const cmd = this.pnpmStep.run
  assert.ok(/--rw\s+"?\$?PN_TMP"?/.test(cmd) || cmd.includes('PN_TMP'), `no temp dir grant in:\n${cmd}`)
  assert.ok(cmd.includes('--rw "$ACTION_ROOT/node_modules"') || cmd.includes('--rw node_modules'), `node_modules not writable in:\n${cmd}`)
  const writeGrants = [...cmd.matchAll(/--rw(x)?\s+\S+/g)].map(m => m[0])
  for (const grant of writeGrants) {
    assert.ok(
      grant.includes('PN_TMP') || grant.includes('node_modules') ||
      grant.includes('pnpm') || grant.includes('corepack') ||
      grant.includes('PNPM_HOME') || grant.includes('dirname') ||
      grant.includes('/dev/null'),
      `unexpected write grant ${grant} in:\n${cmd}`
    )
  }
})

Then('the pnpm sandbox allows outbound TCP on port 443 only', function () {
  assertTcp443Only(this.pnpmStep.run, 'pnpm install')
})

Given('a uv sync command for action path {string} cwd {string} home {string} and groups {string}', function (actionPath, cwd, home, groupArgs) {
  this.uvSyncCmd = buildUvSyncCmd({ actionPath, cwd, home, groupArgs })
})

Then('the uv sync command wraps uv with the sandbox wrapper', function () {
  const cmd = this.uvSyncCmd
  assert.ok(cmd.includes('mkdir -p "/home/u/.cache/uv" "/home/u/.local/share/uv" "/opt/action/.venv"'), 'writable dirs not pre-created (landlock binds existing paths only)')
  assert.ok(cmd.includes('scripts/with-sandbox.sh'), `no wrapper in:\n${cmd}`)
  assert.ok(cmd.includes('--ignore-missing'), `no ignore-missing in:\n${cmd}`)
  assert.ok(/--\s+uv sync /.test(cmd), `uv not the sandboxed command:\n${cmd}`)
  assert.ok(cmd.includes('--ro /run'), `/run not readable (runner DNS symlink) in:\n${cmd}`)
})

Then('the uv sync sandbox grants write access only to the venv and uv caches', function () {
  const cmd = this.uvSyncCmd
  assert.ok(/--rwx\s+"\/opt\/action\/\.venv"/.test(cmd), `venv not writable in:\n${cmd}`)
  const writeGrants = [...cmd.matchAll(/--rw(x)?\s+\S+/g)].map(m => m[0])
  for (const grant of writeGrants) {
    assert.ok(
      grant.includes('/opt/action/.venv') || grant.includes('/.cache/uv') ||
      grant.includes('/.local/share/uv') || grant.includes('/dev/null'),
      `unexpected write grant ${grant} in:\n${cmd}`
    )
  }
})

Then('the uv sync sandbox allows outbound TCP on port 443 only', function () {
  assertTcp443Only(this.uvSyncCmd, 'uv sync')
})

Then('the uv sync command preserves the frozen sync arguments', function () {
  const cmd = this.uvSyncCmd
  assert.ok(cmd.includes('uv sync --frozen --group modelscan --project /opt/action'), `sync args not preserved in:\n${cmd}`)
})

Then('uv sync is only invoked through the sandboxed command builder', function () {
  const src = this.actionScript
  assert.ok(src.includes('buildUvSyncCmd'), 'action.cjs does not use buildUvSyncCmd')
  const bare = src.match(/runCommand\(`uv sync/)
  assert.ok(!bare, 'bare uv sync runCommand still present')
})

Then('a lint step runs the landrun installer', function () {
  const steps = this.lintDoc.jobs[Object.keys(this.lintDoc.jobs)[0]].steps
  const step = steps.find(s => s.run && s.run.includes('src/installLandrun.js'))
  assert.ok(step, 'no lint step installs landrun')
  this.lintLandrunStep = step
})

Then('that lint step runs before the pnpm install step', function () {
  const steps = this.lintDoc.jobs[Object.keys(this.lintDoc.jobs)[0]].steps
  const landrunIdx = steps.indexOf(this.lintLandrunStep)
  const pnpmIdx = steps.findIndex(s => s.run && s.run.includes('pnpm install'))
  assert.ok(pnpmIdx !== -1, 'no pnpm install step found in lint workflow')
  assert.ok(landrunIdx < pnpmIdx, `landrun step (${landrunIdx}) must run before pnpm install (${pnpmIdx})`)
})

Then('the lint pnpm install step wraps the install with the sandbox wrapper', function () {
  const steps = this.lintDoc.jobs[Object.keys(this.lintDoc.jobs)[0]].steps
  const step = steps.find(s => s.run && s.run.includes('pnpm install') && s.run.includes('with-sandbox.sh'))
  assert.ok(step, 'lint pnpm install not wrapped in sandbox')
  assertTcp443Only(step.run, 'lint pnpm install')
})

Then('the coverage py step wraps the toolchain with the sandbox wrapper', function () {
  const steps = this.lintDoc.jobs[Object.keys(this.lintDoc.jobs)[0]].steps
  const step = steps.find(s => s.run && s.run.includes('coverage:py'))
  assert.ok(step, 'no coverage:py step found')
  assert.ok(step.run.includes('scripts/with-sandbox.sh'), `coverage:py not wrapped:\n${step.run}`)
  this.coverageStep = step
})

Then('the coverage sandbox grants write access only to venv caches and temp paths', function () {
  const cmd = this.coverageStep.run
  const writeGrants = [...cmd.matchAll(/--rw(x)?\s+\S+/g)].map(m => m[0])
  for (const grant of writeGrants) {
    assert.ok(
      grant.includes('TMP') || grant.includes('.venv') ||
      grant.includes('coverage') || grant.includes('pnpm') ||
      grant.includes('dirname') || grant.includes('UV_DIR') ||
      grant.includes('uv') || grant.includes('/dev/null'),
      `unexpected write grant ${grant} in:\n${cmd}`
    )
  }
})

Then('the coverage sandbox allows outbound TCP on port 443 only', function () {
  assertTcp443Only(this.coverageStep.run, 'coverage:py')
})

Then('the pnpm audit step wraps the toolchain with the sandbox wrapper', function () {
  const steps = this.lintDoc.jobs[Object.keys(this.lintDoc.jobs)[0]].steps
  const step = steps.find(s => s.run && s.run.includes('pnpm audit'))
  assert.ok(step, 'no pnpm audit step found')
  assert.ok(step.run.includes('scripts/with-sandbox.sh'), `audit not wrapped:\n${step.run}`)
  this.auditStep = step
})

Then('the audit sandbox grants write access only to temp paths', function () {
  const cmd = this.auditStep.run
  const writeGrants = [...cmd.matchAll(/--rw(x)?\s+\S+/g)].map(m => m[0])
  for (const grant of writeGrants) {
    assert.ok(
      grant.includes('TMP') || grant.includes('/dev/null') ||
      grant.includes('PNPM_HOME') || grant.includes('dirname'),
      `unexpected write grant ${grant} in:\n${cmd}`
    )
  }
})

Then('the audit sandbox allows outbound TCP on port 443 only', function () {
  assertTcp443Only(this.auditStep.run, 'pnpm audit')
})
