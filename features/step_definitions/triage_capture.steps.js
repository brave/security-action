import { Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'

Then('the {word} cmd embeds a category comment with {string}', function (runner, fragment) {
  const cmd = this.runners[runner].cmd
  const comment = /<!-- Category:[^>]*-->/.exec(cmd)?.[0]
  assert.ok(comment, `${runner} cmd should carry a Category comment`)
  assert.ok(comment.includes(fragment), `Category comment should embed ${fragment}`)
})

Then('the {word} cmd does not tee a slim jsonl side channel', function (runner) {
  const cmd = this.runners[runner].cmd
  assert.ok(!cmd.includes('slim.jsonl'), `${runner} cmd should not write a slim jsonl side channel`)
  assert.ok(!cmd.includes('| tee'), `${runner} cmd should not tee any side channel`)
})

Then('the reviewdog script calls the triage filter for {string} before post-findings', function (runner) {
  const script = fs.readFileSync('assets/reviewdog.sh', 'utf8')
  const needle = 'triage-filter.sh" "$' + 'runner"'
  const filterIdx = script.indexOf(needle)
  const postIdx = script.indexOf('post-findings.sh')
  assert.ok(filterIdx >= 0, `reviewdog.sh should call triage-filter.sh for ${runner}`)
  assert.ok(postIdx > filterIdx, 'triage filter must run before post-findings')
})

Then('the triage filter call is fail-open', function () {
  const script = fs.readFileSync('assets/reviewdog.sh', 'utf8')
  assert.ok(script.includes('triage-filter.sh" "$runner" "$SCRIPTPATH/$runner.log" || true'), 'triage filter call must be fail-open')
})

Then('the triage filter wrapper has the executable bit set', function () {
  const mode = fs.statSync('assets/reviewdog/triage-filter.sh').mode
  assert.ok(mode & 0o111, 'triage-filter.sh should be executable')
})
