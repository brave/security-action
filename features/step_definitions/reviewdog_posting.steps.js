/** Steps for reviewdog_posting.feature.
 *
 * Exercises assets/reviewdog/post-findings.sh with a stub `reviewdog`
 * binary on PATH. The stub records each post's stdin to
 * <stubdir>/received-<n> and replays scenario-configured exit codes and
 * stderr per call.
 */
import { spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Before, Given, Then, When } from '@cucumber/cucumber'

const STEP_DIR = fileURLToPath(new URL('.', import.meta.url))

const STUB = `#!/bin/bash
n=$(cat "$STUB_CALLS" 2>/dev/null || echo 0)
n=$((n+1))
echo "$n" > "$STUB_CALLS"
cat > "$STUB_DIR/received-$n"
rcvar="STUB_RC_$n"
errvar="STUB_STDERR_$n"
if [ -n "\${!errvar:-}" ]; then
  printf '%s\\n' "\${!errvar}" >&2
fi
exit "\${!rcvar:-0}"
`

Before(function () {
  this.tmpDir = join(STEP_DIR, '..', '..', 'tmp', `reviewdog-posting-${process.pid}-${Date.now()}`)
  this.stubDir = join(this.tmpDir, 'stub')
  this.binDir = join(this.stubDir, 'bin')
  this.scriptPath = join(STEP_DIR, '..', '..', 'assets')
  mkdirSync(this.binDir, { recursive: true })
  this.stubEnv = {}
})

Given('a runner log with findings for {string}', function (path) {
  writeFileSync(join(this.tmpDir, 'sveltegrep.log'), `${path}:10: finding 0\n`)
})

Given('a runner log with findings for {string} only', function (path) {
  writeFileSync(join(this.tmpDir, 'sveltegrep.log'), `${path}:10: finding 0\n`)
})

Given('a runner log with findings for {string} and {string}', function (pathA, pathB) {
  writeFileSync(join(this.tmpDir, 'sveltegrep.log'), `${pathA}:10: finding 0\n${pathB}:11: finding 1\n`)
})

Given('a reviewdog that succeeds on the first post', function () {
  this.stubEnv.STUB_RC_1 = '0'
})

Given('a reviewdog that rejects {string} as too large on the first post and succeeds on the second', function (path) {
  this.stubEnv.STUB_RC_1 = '1'
  this.stubEnv.STUB_STDERR_1 = tooLargeStderr(path)
  this.stubEnv.STUB_RC_2 = '0'
})

Given('a reviewdog that rejects {string} as too large on every post', function (path) {
  this.stubEnv.STUB_RC_1 = '1'
  this.stubEnv.STUB_STDERR_1 = tooLargeStderr(path)
  this.stubEnv.STUB_RC_2 = '1'
  this.stubEnv.STUB_STDERR_2 = tooLargeStderr(path)
})

Given('a reviewdog that always fails with {string}', function (message) {
  this.stubEnv.STUB_RC_1 = '1'
  this.stubEnv.STUB_STDERR_1 = `reviewdog: POST failed: 422 Unprocessable Entity [{Resource: Field: Code: Message:${message}}]`
  this.stubEnv.STUB_RC_2 = '1'
  this.stubEnv.STUB_STDERR_2 = message
})

When('the findings are posted for the runner', function () {
  const stub = join(this.binDir, 'reviewdog')
  writeFileSync(stub, STUB)
  chmodSync(stub, 0o755)
  writeFileSync(join(this.stubDir, 'calls'), '0')
  this.postResult = spawnSync('bash', [join(this.scriptPath, 'reviewdog', 'post-findings.sh'), 'sveltegrep'], {
    cwd: this.tmpDir,
    env: {
      ...process.env,
      PATH: `${this.binDir}:${process.env.PATH}`,
      STUB_DIR: this.stubDir,
      STUB_CALLS: join(this.stubDir, 'calls'),
      ...this.stubEnv
    }
  })
})

Then('reviewdog.fail.log is not created', function () {
  let listing = ''
  try {
    listing = readFileSync(join(this.tmpDir, 'reviewdog.fail.log')).toString()
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    return
  }
  throw new Error(`reviewdog.fail.log exists:\n${listing}`)
})

Then('the first post contains {string}', function (text) {
  postContains(this, 1, text)
})

Then('the second post contains {string}', function (text) {
  postContains(this, 2, text)
})

Then('the second post does not contain {string}', function (text) {
  postNotContains(this, 2, text)
})

Then('the second post is empty', function () {
  const content = postContents(this, 2)
  if (content !== '') {
    throw new Error(`expected empty second post, got:\n${content}`)
  }
})

Then('reviewdog.fail.log contains {string}', function (text) {
  const failLog = failLogContents(this)
  if (!failLog.includes(text)) {
    throw new Error(`reviewdog.fail.log lacks "${text}":\n${failLog}`)
  }
})

Then('reviewdog.fail.log does not contain {string}', function (text) {
  const failLog = failLogContents(this)
  if (failLog.includes(text)) {
    throw new Error(`reviewdog.fail.log unexpectedly contains "${text}":\n${failLog}`)
  }
})

// ── helpers ──────────────────────────────────────────────────────────────────

function tooLargeStderr (path) {
  return `reviewdog: POST https://github.com/example/repo/pulls/1/reviews: 422 Unprocessable Entity [{Resource: Field: Code: Message:Diff entry ${path} diff is too large, and Line could not be resolved}]`
}

function postContents (world, n) {
  return readFileSync(join(world.stubDir, `received-${n}`)).toString()
}

function postContains (world, n, text) {
  const content = postContents(world, n)
  if (!content.includes(text)) {
    throw new Error(`post ${n} lacks "${text}":\n${content}`)
  }
}

function postNotContains (world, n, text) {
  const content = postContents(world, n)
  if (content.includes(text)) {
    throw new Error(`post ${n} unexpectedly contains "${text}":\n${content}`)
  }
}

function failLogContents (world) {
  return readFileSync(join(world.tmpDir, 'reviewdog.fail.log')).toString()
}
