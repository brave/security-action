import { strict as assert } from 'assert'
import modelscanPostComments from './modelscanPostComments.js'

console.log('Testing modelscanPostComments...')

function mockGithub (overrides = {}) {
  const calls = []

  return {
    calls,
    graphql: async (query, variables) => {
      calls.push({ method: 'graphql', query: query.slice(0, 50), variables })
      const body = overrides.graphqlBody || {
        repository: {
          pullRequest: {
            reviewThreads: { nodes: [] }
          }
        }
      }
      return body
    },
    rest: {
      pulls: {
        get: async () => {
          calls.push({ method: 'pulls.get' })
          return { data: { head: { sha: 'abc1234' } } }
        },
        createReviewComment: async (params) => {
          calls.push({ method: 'createReviewComment', params })
          return { data: { id: 1 } }
        }
      }
    }
  }
}

function mockContext (overrides = {}) {
  return {
    repo: { owner: 'test-org', repo: 'test-repo' },
    issue: { number: 42 },
    ...overrides
  }
}

function mockSpawn (result) {
  return () => result
}

const ACTION_PATH = process.cwd()

// ─────────────────────────────────────────────────────────────────────────────
// Test: no findings (empty stdout) → no comments posted
{
  const gh = mockGithub()
  const ctx = mockContext()

  await modelscanPostComments({
    github: gh,
    context: ctx,
    actionPath: ACTION_PATH,
    assignees: 'thypon',
    debug: false,
    _spawn: mockSpawn({ stdout: '', stderr: '' })
  })

  assert.equal(gh.calls.length, 0, 'No calls when no findings')
}
console.log('  no findings → no calls')

// ─────────────────────────────────────────────────────────────────────────────
// Test: findings present → post review comments
{
  const gh = mockGithub()
  const ctx = mockContext()

  await modelscanPostComments({
    github: gh,
    context: ctx,
    actionPath: ACTION_PATH,
    assignees: 'thypon',
    debug: false,
    _spawn: mockSpawn({
      stdout: JSON.stringify({ path: 'model.pkl', severity: 'CRITICAL', description: 'eval in pickle', module: '__builtin__', operator: 'eval', scanner: 'pickle' }) + '\n',
      stderr: ''
    })
  })

  const commentCall = gh.calls.find(c => c.method === 'createReviewComment')
  assert.ok(commentCall, 'createReviewComment called')
  assert.equal(commentCall.params.subject_type, 'file')
  assert.equal(commentCall.params.path, 'model.pkl')
  assert.equal(commentCall.params.side, 'RIGHT')
  assert.equal(commentCall.params.commit_id, 'abc1234')
  assert.ok(commentCall.params.body.includes('CRITICAL'))
  assert.ok(commentCall.params.body.includes('eval'))
  assert.ok(commentCall.params.body.includes('<!-- Category: security -->'))
  assert.ok(commentCall.params.body.includes('<!-- modelscan -->'))
  assert.ok(commentCall.params.body.includes('<br>Cc @thypon'))
}
console.log('  findings → posts review comments')

// ─────────────────────────────────────────────────────────────────────────────
// Test: dedup — skip paths with existing non-outdated modelscan comments
{
  const gh = mockGithub({
    graphqlBody: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: [{
              isOutdated: false,
              path: 'existing.pkl',
              comments: {
                totalCount: 1,
                nodes: [{
                  author: { login: 'github-actions' },
                  body: '<!-- modelscan -->\n<!-- Category: security -->'
                }]
              }
            }]
          }
        }
      }
    }
  })
  const ctx = mockContext()

  await modelscanPostComments({
    github: gh,
    context: ctx,
    actionPath: ACTION_PATH,
    assignees: 'thypon',
    debug: false,
    _spawn: mockSpawn({
      stdout: JSON.stringify({ path: 'existing.pkl', severity: 'HIGH', description: 'open in pickle', module: '__builtin__', operator: 'open', scanner: 'pickle' }) + '\n',
      stderr: ''
    })
  })

  const commentCalls = gh.calls.filter(c => c.method === 'createReviewComment')
  assert.equal(commentCalls.length, 0, 'No comments for already-flagged path')
}
console.log('  dedup skips existing modelscan paths')

// ─────────────────────────────────────────────────────────────────────────────
// Test: outdated single-comment threads don't block re-posting
{
  const gh = mockGithub({
    graphqlBody: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: [{
              isOutdated: true,
              path: 'retry.pkl',
              comments: {
                totalCount: 1,
                nodes: [{
                  author: { login: 'github-actions' },
                  body: '<!-- modelscan -->\n<!-- Category: security -->'
                }]
              }
            }]
          }
        }
      }
    }
  })
  const ctx = mockContext()

  await modelscanPostComments({
    github: gh,
    context: ctx,
    actionPath: ACTION_PATH,
    assignees: 'thypon',
    debug: false,
    _spawn: mockSpawn({
      stdout: JSON.stringify({ path: 'retry.pkl', severity: 'HIGH', description: 'exec in pickle', module: '__builtin__', operator: 'exec', scanner: 'pickle' }) + '\n',
      stderr: ''
    })
  })

  const commentCalls = gh.calls.filter(c => c.method === 'createReviewComment')
  assert.equal(commentCalls.length, 1, 'Re-posts after outdated comment cleaned up')
}
console.log('  outdated threads allow re-posting')

// ─────────────────────────────────────────────────────────────────────────────
// Test: cap at 10 comments
{
  const findings = []
  for (let i = 0; i < 15; i++) {
    findings.push(JSON.stringify({ path: `model${i}.pkl`, severity: 'LOW', description: `finding ${i}`, module: 'os', operator: 'system', scanner: 'pickle' }))
  }
  const gh = mockGithub()
  const ctx = mockContext()

  await modelscanPostComments({
    github: gh,
    context: ctx,
    actionPath: ACTION_PATH,
    assignees: 'thypon',
    debug: false,
    _spawn: mockSpawn({ stdout: findings.join('\n') + '\n', stderr: '' })
  })

  const commentCalls = gh.calls.filter(c => c.method === 'createReviewComment')
  assert.equal(commentCalls.length, 10, 'Capped at 10 comments')
}
console.log('  cap at 10 comments')

// ─────────────────────────────────────────────────────────────────────────────
// Test: 422 invalid path (deleted file) handled gracefully
{
  const gh = mockGithub()
  gh.rest.pulls.createReviewComment = async () => {
    const err = new Error('is not a valid path')
    err.status = 422
    throw err
  }
  const ctx = mockContext()

  await modelscanPostComments({
    github: gh,
    context: ctx,
    actionPath: ACTION_PATH,
    assignees: 'thypon',
    debug: false,
    _spawn: mockSpawn({
      stdout: JSON.stringify({ path: 'deleted.pkl', severity: 'HIGH', description: 'bad', module: 'os', operator: 'system', scanner: 'pickle' }) + '\n',
      stderr: ''
    })
  })
  // Should not throw → test passes
}
console.log('  422 on deleted file handled gracefully')

console.log('\n✅ All modelscanPostComments tests passed!')
