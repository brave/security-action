/**
 * Unit tests for assignee login validation (sanitize, existence pre-check,
 * non-fatal assign call).
 */
import { test, describe } from 'node:test'
import assert from 'assert'
import { sanitizeAssignees, filterExistingLogins, addAssigneesSafely, LOGIN_RE, MAX_ASSIGNEES } from './validateAssignees.js'

// The exact pollution captured from the 404 payload of
// brave-experiments/brave-bot PRs #20/#58/#59 (add-assignees got the whole
// HTML/LLM message split on whitespace into per-word "logins").
const POLLUTED = 'thypon <br><br>Please consider an alternative approach that avoids this security concern, or request a review from the sec-team on slack.'

describe('sanitizeAssignees', () => {
  test('acceptance: polluted HTML message yields only the leading login', () => {
    const dropped = []
    const valid = sanitizeAssignees(POLLUTED, { onDropped: d => dropped.push(...d) })
    assert.deepEqual(valid, ['thypon'])
    assert.ok(dropped.includes('Please'))
    assert.ok(dropped.includes('slack'))
    assert.ok(dropped.length > 10)
  })

  test('plain whitespace/comma lists pass through', () => {
    assert.deepEqual(sanitizeAssignees('carol dave'), ['carol', 'dave'])
    assert.deepEqual(sanitizeAssignees('carol, dave'), ['carol', 'dave'])
    assert.deepEqual(sanitizeAssignees('thypon'), ['thypon'])
  })

  test('dedupe is case-insensitive, first casing wins', () => {
    assert.deepEqual(sanitizeAssignees('Alice alice bob ALICE'), ['Alice', 'bob'])
  })

  test('tokens that are not logins are dropped', () => {
    const dropped = []
    const valid = sanitizeAssignees('alice this..that bob- -carol fo@o', { onDropped: d => dropped.push(...d) })
    assert.deepEqual(valid, ['alice'])
    assert.deepEqual(dropped, ['this..that', 'bob-', '-carol', 'fo@o'])
  })

  test('max 39 chars, cannot start with a hyphen or digit-only underscore', () => {
    assert.deepEqual(sanitizeAssignees('a'.repeat(39)), ['a'.repeat(39)])
    assert.deepEqual(sanitizeAssignees('a'.repeat(40)), [])
    assert.deepEqual(sanitizeAssignees('-abc'), [])
  })

  test('value with no trusted text yields nothing', () => {
    assert.deepEqual(sanitizeAssignees('<br><br>Please consider'), [])
    assert.deepEqual(sanitizeAssignees(''), [])
    assert.deepEqual(sanitizeAssignees(null), [])
    assert.deepEqual(sanitizeAssignees(undefined), [])
  })

  test('list is capped and the overflow is reported', () => {
    const many = Array.from({ length: 14 }, (_, i) => `user${i}`)
    const dropped = []
    const valid = sanitizeAssignees(many.join(' '), { onDropped: d => dropped.push(...d) })
    assert.equal(valid.length, MAX_ASSIGNEES)
    assert.deepEqual(dropped, ['user10', 'user11', 'user12', 'user13'])
  })

  test('sanitizing is idempotent', () => {
    const once = sanitizeAssignees(POLLUTED)
    const twice = sanitizeAssignees(once.join('\n'))
    assert.deepEqual(twice, once)
    assert.deepEqual(sanitizeAssignees('carol, dave'.replace('carol', 'carol')), ['carol', 'dave'])
  })

  test('every produced login matches the login rules (contract)', () => {
    for (const login of sanitizeAssignees(POLLUTED)) {
      assert.match(login, LOGIN_RE)
    }
  })
})

describe('filterExistingLogins', () => {
  function mockGithub (responses) {
    const requests = []
    return {
      requests,
      request: async (route, params) => {
        requests.push({ route, params })
        const response = responses[params.login]
        if (response instanceof Error) { throw response }
        return response ?? { data: { type: 'User' } }
      }
    }
  }

  test('keeps logins that exist as user accounts', async () => {
    const github = mockGithub({ alice: { data: { type: 'User' } } })
    const kept = await filterExistingLogins(github, ['alice'])
    assert.deepEqual(kept, ['alice'])
    assert.equal(github.requests.length, 1)
    assert.equal(github.requests[0].route, 'GET /users/{login}')
  })

  test('drops 404 logins with a warning', async () => {
    const dropped = []
    const github = mockGithub({ ghost: Object.assign(new Error('Not Found'), { status: 404 }) })
    const kept = await filterExistingLogins(github, ['ghost'], { onDropped: d => dropped.push(...d) })
    assert.deepEqual(kept, [])
    assert.deepEqual(dropped, ['ghost (login does not exist)'])
  })

  test('drops organizations (they cannot be assignees)', async () => {
    const dropped = []
    const github = mockGithub({ slack: { data: { type: 'Organization' } } })
    const kept = await filterExistingLogins(github, ['slack'], { onDropped: d => dropped.push(...d) })
    assert.deepEqual(kept, [])
    assert.deepEqual(dropped, ['slack (not a user account)'])
  })

  test('drops on any lookup error without failing', async () => {
    const dropped = []
    const github = mockGithub({ down: Object.assign(new Error('boom'), { status: 500 }) })
    const kept = await filterExistingLogins(github, ['down'], { onDropped: d => dropped.push(...d) })
    assert.deepEqual(kept, [])
    assert.deepEqual(dropped, ['down (lookup failed (500))'])
  })

  test('caches verdicts per run', async () => {
    const github = mockGithub({ alice: { data: { type: 'User' } } })
    const cache = new Map()
    await filterExistingLogins(github, ['alice'], { cache })
    await filterExistingLogins(github, ['alice'], { cache })
    assert.equal(github.requests.length, 1)
  })

  test('empty input makes no requests', async () => {
    const github = mockGithub({})
    assert.deepEqual(await filterExistingLogins(github, []), [])
    assert.equal(github.requests.length, 0)
  })
})

describe('addAssigneesSafely', () => {
  test('adds assignees on success', async () => {
    const calls = []
    const github = { rest: { issues: { addAssignees: async params => { calls.push(params) } } } }
    const ok = await addAssigneesSafely(github, {
      owner: 'o', repo: 'r', issue_number: 7, assignees: ['alice']
    })
    assert.equal(ok, true)
    assert.deepEqual(calls, [{ owner: 'o', repo: 'r', issue_number: 7, assignees: ['alice'] }])
  })

  test('422 from add-assignees warns and continues', async () => {
    const warnings = []
    const github = {
      rest: { issues: { addAssignees: async () => { throw Object.assign(new Error('Validation Failed'), { status: 422 }) } } }
    }
    const ok = await addAssigneesSafely(github, {
      owner: 'o', repo: 'r', issue_number: 7, assignees: ['outsider']
    }, { warn: m => warnings.push(m) })
    assert.equal(ok, false)
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /assign: skipped \(422\)/)
  })

  test('404 from add-assignees warns and continues', async () => {
    const warnings = []
    const github = {
      rest: { issues: { addAssignees: async () => { throw Object.assign(new Error('Not Found'), { status: 404 }) } } }
    }
    const ok = await addAssigneesSafely(github, {
      owner: 'o', repo: 'r', issue_number: 7, assignees: ['ghost']
    }, { warn: m => warnings.push(m) })
    assert.equal(ok, false)
    assert.match(warnings[0], /assign: skipped \(404\)/)
  })

  test('error without status still warns and continues', async () => {
    const warnings = []
    const github = {
      rest: { issues: { addAssignees: async () => { throw new Error('socket hang up') } } }
    }
    const ok = await addAssigneesSafely(github, {
      owner: 'o', repo: 'r', issue_number: 7, assignees: ['x']
    }, { warn: m => warnings.push(m) })
    assert.equal(ok, false)
    assert.match(warnings[0], /assign: skipped \(no status\)/)
  })

  test('empty assignee list makes no API call', async () => {
    const calls = []
    const github = { rest: { issues: { addAssignees: async params => { calls.push(params) } } } }
    assert.equal(await addAssigneesSafely(github, { owner: 'o', repo: 'r', issue_number: 7, assignees: [] }), false)
    assert.equal(await addAssigneesSafely(github, { owner: 'o', repo: 'r', issue_number: 7 }), false)
    assert.equal(calls.length, 0)
  })

  test('fork-context 403 is rethrown for guardWrite', async () => {
    const warnings = []
    const github = {
      rest: { issues: { addAssignees: async () => { throw Object.assign(new Error('Resource not accessible by integration'), { status: 403 }) } } }
    }
    await assert.rejects(
      addAssigneesSafely(github, {
        owner: 'o', repo: 'r', issue_number: 7, assignees: ['alice']
      }, { warn: m => warnings.push(m) }),
      /Resource not accessible by integration/
    )
    assert.equal(warnings.length, 0)
  })
})
