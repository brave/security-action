/**
 * Tests for reconcileNudgeMessages module
 */
import { strict as assert } from 'assert'
import reconcileNudgeMessages from './reconcileNudgeMessages.js'

console.log('Testing reconcileNudgeMessages...')

// Helper: create a mock GitHub client
function mockGithub (alertsByRepo) {
  return {
    paginate: async (url, opts) => {
      const key = `${opts.owner}/${opts.repo}`
      return alertsByRepo[key] || []
    }
  }
}

// Helper: create a mock listSlackMessageRepos
function mockListRepos (repos) {
  return async () => repos
}

// Helper: create a mock deleteSlackMessages that
// records calls
function mockDeleteMessages () {
  const calls = []
  return {
    fn: async (opts) => { calls.push(opts) },
    calls
  }
}

// Test: stale repos (no qualifying alerts) get cleaned
{
  const github = mockGithub({
    'org/repo1': [],
    'org/repo2': []
  })
  const del = mockDeleteMessages()

  const stale = await reconcileNudgeMessages({
    github,
    slackToken: 'xoxb-test',
    channel: '#test',
    dismissedRepos: [],
    debug: false,
    listSlackMessageRepos: mockListRepos(['org/repo1', 'org/repo2']),
    deleteSlackMessages: del.fn
  })

  assert.deepEqual(stale, ['org/repo1', 'org/repo2'])
  assert.equal(del.calls.length, 1, 'Should call delete once')
  assert.deepEqual(
    del.calls[0].repos,
    ['org/repo1', 'org/repo2']
  )
}
console.log('  stale repos get cleaned')

// Test: repos with qualifying alerts are kept
{
  const github = mockGithub({
    'org/repo1': [{
      security_advisory: { summary: 'XSS vulnerability' },
      security_vulnerability: {
        first_patched_version: { identifier: '1.0.1' }
      }
    }]
  })
  const del = mockDeleteMessages()

  const stale = await reconcileNudgeMessages({
    github,
    slackToken: 'xoxb-test',
    channel: '#test',
    dismissedRepos: [],
    debug: false,
    listSlackMessageRepos: mockListRepos(['org/repo1']),
    deleteSlackMessages: del.fn
  })

  assert.deepEqual(stale, [])
  assert.equal(del.calls.length, 0, 'Should not delete')
}
console.log('  repos with qualifying alerts are kept')

// Test: hotword-matching alerts are filtered out
{
  const github = mockGithub({
    'org/repo1': [{
      security_advisory: {
        summary: 'Denial of Service in package'
      },
      security_vulnerability: {
        first_patched_version: { identifier: '2.0.0' }
      }
    }]
  })
  const del = mockDeleteMessages()

  const stale = await reconcileNudgeMessages({
    github,
    slackToken: 'xoxb-test',
    channel: '#test',
    dismissedRepos: [],
    debug: false,
    listSlackMessageRepos: mockListRepos(['org/repo1']),
    deleteSlackMessages: del.fn
  })

  assert.deepEqual(stale, ['org/repo1'])
  assert.equal(del.calls.length, 1)
}
console.log('  hotword alerts are filtered out')

// Test: alerts without patched version are filtered
{
  const github = mockGithub({
    'org/repo1': [{
      security_advisory: { summary: 'Real vulnerability' },
      security_vulnerability: {
        first_patched_version: null
      }
    }]
  })
  const del = mockDeleteMessages()

  const stale = await reconcileNudgeMessages({
    github,
    slackToken: 'xoxb-test',
    channel: '#test',
    dismissedRepos: [],
    debug: false,
    listSlackMessageRepos: mockListRepos(['org/repo1']),
    deleteSlackMessages: del.fn
  })

  assert.deepEqual(stale, ['org/repo1'])
}
console.log('  alerts without patched version are filtered')

// Test: already-dismissed repos are excluded
{
  const github = mockGithub({
    'org/repo2': []
  })
  const del = mockDeleteMessages()

  const stale = await reconcileNudgeMessages({
    github,
    slackToken: 'xoxb-test',
    channel: '#test',
    dismissedRepos: ['org/repo1'],
    debug: false,
    listSlackMessageRepos: mockListRepos([
      'org/repo1', 'org/repo2'
    ]),
    deleteSlackMessages: del.fn
  })

  assert.deepEqual(stale, ['org/repo2'])
  // repo1 should not be in the delete call
  assert.ok(!del.calls[0].repos.includes('org/repo1'))
}
console.log('  already-dismissed repos are excluded')

// Test: API errors keep the message (don't delete)
{
  const github = {
    paginate: async () => {
      throw new Error('Not Found')
    }
  }
  const del = mockDeleteMessages()

  const stale = await reconcileNudgeMessages({
    github,
    slackToken: 'xoxb-test',
    channel: '#test',
    dismissedRepos: [],
    debug: false,
    listSlackMessageRepos: mockListRepos(['org/deleted-repo']),
    deleteSlackMessages: del.fn
  })

  assert.deepEqual(stale, [])
  assert.equal(del.calls.length, 0, 'Should not delete on error')
}
console.log('  API errors keep the message')

// Test: no nudged repos means no work done
{
  const github = mockGithub({})
  const del = mockDeleteMessages()

  const stale = await reconcileNudgeMessages({
    github,
    slackToken: 'xoxb-test',
    channel: '#test',
    dismissedRepos: [],
    debug: false,
    listSlackMessageRepos: mockListRepos([]),
    deleteSlackMessages: del.fn
  })

  assert.deepEqual(stale, [])
  assert.equal(del.calls.length, 0)
}
console.log('  no nudged repos = no work')

console.log('\n✅ All reconcileNudgeMessages tests passed!')
