import { Then } from '@cucumber/cucumber'
import assert from 'assert'

// Shared assertions over the mock Slack client API recorder,
// used by the slack_utils, cleanup and delete features.

Then('one message is deleted', function () {
  assert.equal(this.web.__recorder.count('chat.delete'), 1)
})

Then('no message is deleted', function () {
  assert.equal(this.web.__recorder.count('chat.delete'), 0)
})

Then('no deletion was performed', function () {
  assert.equal(this.web.__recorder.count('chat.delete'), 0)
})

Then('two messages are counted', function () {
  assert.equal(this.result, 2)
  assert.equal(this.web.__recorder.count('chat.delete'), 0)
})
