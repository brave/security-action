import { Given, Then } from '@cucumber/cucumber'
import assert from 'assert'

// Shared fault-injection steps for the download retry loop. installLandrun /
// installOpengrep drive it via their `_fetchOnce` seam (set up by the
// "installing landrun" / "installing opengrep" hooks when a fetch script
// has been given below).

Given('the per-attempt fetch returns HTTP {int} twice then succeeds', function (status) {
  this.fetchOnce = this.makeMockFetchOnce([status, status, 200])
  // Skip the real 2s/4s backoff sleeps: the cucumber step timeout is 5s.
  this.sleep = () => Promise.resolve()
})

Given('the per-attempt fetch returns HTTP {int} on every attempt', function (status) {
  this.fetchOnce = this.makeMockFetchOnce([status])
  this.sleep = () => Promise.resolve()
})

Then('the download retried {int} attempt(s)', function (expected) {
  assert.ok(this.fetchOnce, 'no per-attempt fetch seam configured')
  assert.equal(this.fetchOnce.__count(), expected)
})
