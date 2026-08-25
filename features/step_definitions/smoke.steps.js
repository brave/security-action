import { Given, Then } from '@cucumber/cucumber'
import assert from 'assert'
import fc from 'fast-check'

Given('the BDD world provides mock factories', function () {
  assert.equal(typeof this.makeMockSlackWeb, 'function', 'makeMockSlackWeb attached')
  assert.equal(typeof this.makeMockGithub, 'function', 'makeMockGithub attached')
  assert.equal(typeof this.makeMockCore, 'function', 'makeMockCore attached')
  assert.equal(typeof this.makeMockSpawn, 'function', 'makeMockSpawn attached')

  const web = this.makeMockSlackWeb({ channelPages: [[{ name: 'general', id: 'C001' }]] })
  assert.equal(web.__recorder.count('chat.postMessage'), 0)

  const github = this.makeMockGithub({ alertsByRepo: { 'org/repo': [] } })
  assert.equal(github.__recorder.count('paginate'), 0)

  const core = this.makeMockCore()
  core.info('hello')
  assert.equal(core.__recorder.count('info'), 1)
})

Then('cucumber executes scenarios successfully', function () {
  assert.ok(true)
})

Given('fast-check is available', function () {
  assert.equal(typeof fc, 'object')
})

Then('a property can be asserted', async function () {
  await fc.assert(fc.property(fc.integer({ min: 0 }), n => n >= 0), { numRuns: 10 })
})
