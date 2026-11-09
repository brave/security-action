import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import assignDependabotAlert, { UNPERMITTED_RE } from './assignDependabotAlert.js'

// Fake octokit: records PATCH params and rejects when the
// assignees array contains a login in `unpermitted`, mirroring
// the real 422 "User X is not permitted to be assigned to this
// alert" all-or-nothing validation.
function makeMockRequest (unpermitted) {
  const calls = []
  const request = async (route, params = {}) => {
    calls.push({ route, params })
    const bad = (params.assignees || []).find(a => unpermitted.includes(a))
    if (bad) {
      const err = new Error(
        `User ${bad} is not permitted to be assigned to this alert`
      )
      err.status = 422
      throw err
    }
    return { status: 200, data: {} }
  }
  request.calls = calls
  return request
}

const HEADERS = { 'X-GitHub-Api-Version': '2022-11-28' }

test('assigns the full list when everyone is permitted', async () => {
  const request = makeMockRequest([])
  const { assigned, dropped } = await assignDependabotAlert({
    github: { request },
    owner: 'brave',
    repo: 'foo',
    alertNumber: 1,
    assignees: ['alice', 'bob'],
    headers: HEADERS
  })
  assert.deepEqual(assigned, ['alice', 'bob'])
  assert.deepEqual(dropped, [])
  assert.equal(request.calls.length, 1)
  assert.equal(request.calls[0].route,
    'PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}')
  assert.deepEqual(request.calls[0].params.assignees, ['alice', 'bob'])
  assert.equal(request.calls[0].params.alert_number, 1)
})

test('drops the unpermitted user and retries with the rest', async () => {
  const request = makeMockRequest(['bob'])
  const { assigned, dropped } = await assignDependabotAlert({
    github: { request },
    owner: 'brave',
    repo: 'foo',
    alertNumber: 7,
    assignees: ['alice', 'bob'],
    headers: HEADERS
  })
  assert.deepEqual(assigned, ['alice'])
  assert.deepEqual(dropped, ['bob'])
  assert.equal(request.calls.length, 2)
  assert.deepEqual(request.calls[0].params.assignees, ['alice', 'bob'])
  assert.deepEqual(request.calls[1].params.assignees, ['alice'])
})

test('drops each unpermitted user until one remains', async () => {
  const request = makeMockRequest(['bob', 'carol'])
  const { assigned, dropped } = await assignDependabotAlert({
    github: { request },
    owner: 'brave',
    repo: 'foo',
    alertNumber: 7,
    assignees: ['alice', 'carol', 'bob'],
    headers: HEADERS
  })
  assert.deepEqual(assigned, ['alice'])
  assert.deepEqual(dropped.sort(), ['bob', 'carol'])
  assert.equal(request.calls.length, 3)
  assert.deepEqual(request.calls[2].params.assignees, ['alice'])
})

test('never patches an empty assignees array', async () => {
  const request = makeMockRequest(['bob'])
  const { assigned, dropped } = await assignDependabotAlert({
    github: { request },
    owner: 'brave',
    repo: 'foo',
    alertNumber: 7,
    assignees: ['bob'],
    headers: HEADERS
  })
  assert.deepEqual(assigned, [])
  assert.deepEqual(dropped, ['bob'])
  assert.equal(request.calls.length, 1)
})

test('rethrows errors that are not about unpermitted users', async () => {
  const request = async () => {
    throw new Error('Validation Failed')
  }
  await assert.rejects(
    assignDependabotAlert({
      github: { request },
      owner: 'brave',
      repo: 'foo',
      alertNumber: 7,
      assignees: ['alice'],
      headers: HEADERS
    }),
    /Validation Failed/
  )
})

test('rethrows when the named login was not in the request', async () => {
  const request = async (route, params = {}) => {
    throw new Error(
      'User mallory is not permitted to be assigned to this alert'
    )
  }
  await assert.rejects(
    assignDependabotAlert({
      github: { request },
      owner: 'brave',
      repo: 'foo',
      alertNumber: 7,
      assignees: ['alice'],
      headers: HEADERS
    }),
    /mallory/
  )
})

test('UNPERMITTED_RE extracts the login', () => {
  assert.equal(
    UNPERMITTED_RE.exec(
      'User bravebot is not permitted to be assigned to this alert'
    )[1],
    'bravebot'
  )
  assert.equal(UNPERMITTED_RE.exec('Validation Failed'), null)
})
