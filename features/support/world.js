import { setWorldConstructor, World, defineParameterType } from '@cucumber/cucumber'

// "2026-08-25" -> Date at local midnight (modules use local getDate())
defineParameterType({
  name: 'iso-date',
  regexp: /\d{4}-\d{2}-\d{2}/,
  transformer: (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
})

/**
 * Shared test doubles for BDD step definitions.
 * Factories mirror the inline mock patterns used by the node:test suites.
 */
export class Recorder {
  constructor () {
    this.calls = []
  }

  record (method, params) {
    this.calls.push({ method, params: params ?? {} })
  }

  find (method) {
    return this.calls.filter(call => call.method === method)
  }

  count (method) {
    return this.find(method).length
  }

  paramsOf (method) {
    return this.find(method).map(call => call.params)
  }
}

/**
 * Fake Slack WebClient. Channel listing, history pagination, thread replies
 * and chat calls are recorded on web.__recorder.
 *
 * - channelPages: array of pages, each an array of { name, id }
 * - messages: single history page (ignored when historyPages set)
 * - historyPages: array of pages for conversations.history pagination
 * - repliesByTs: map of thread ts -> array of messages
 */
export function makeMockSlackWeb ({
  channelPages = [],
  messages = null,
  historyPages = null,
  repliesByTs = {},
  postMessageResult = { ts: '1234.5678' },
  chatDeleteOk = true
} = {}) {
  const rec = new Recorder()
  const pages = channelPages.length ? channelPages : [[{ name: 'general', id: 'C001' }]]
  let channelCursor = 0
  let historyCursor = 0

  const web = {
    __recorder: rec,
    conversations: {
      list: async ({ cursor } = {}) => {
        rec.record('conversations.list', { cursor })
        const page = channelCursor < pages.length ? pages[channelCursor] : []
        const next = channelCursor + 1 < pages.length ? `cursor${channelCursor + 1}` : ''
        channelCursor++
        return { channels: page, response_metadata: { next_cursor: next } }
      },
      history: async ({ cursor } = {}) => {
        rec.record('conversations.history', { cursor })
        if (historyPages) {
          const page = historyCursor < historyPages.length ? historyPages[historyCursor] : []
          const hasMore = historyCursor + 1 < historyPages.length
          const next = hasMore ? `cursor${historyCursor + 1}` : ''
          historyCursor++
          return { messages: page, has_more: hasMore, response_metadata: { next_cursor: next } }
        }
        return { messages: messages || [], has_more: false, response_metadata: {} }
      },
      replies: async ({ ts }) => {
        rec.record('conversations.replies', { ts })
        return { messages: repliesByTs[ts] || [] }
      }
    },
    chat: {
      postMessage: async (params) => {
        rec.record('chat.postMessage', params)
        return { ok: true, ts: postMessageResult.ts }
      },
      update: async (params) => {
        rec.record('chat.update', params)
        return { ok: true }
      },
      delete: async (params) => {
        rec.record('chat.delete', params)
        return { ok: chatDeleteOk }
      }
    }
  }
  return web
}

/**
 * Fake Octokit instance covering the patterns used by src modules:
 * paginate (Dependabot alerts / repo properties), graphql (review threads,
 * timelines) and a few rest endpoints. All calls recorded on github.__recorder.
 *
 * - alertsByRepo: map 'owner/repo' -> array of alert objects
 * - graphqlBody: object returned by every graphql call
 * - propertyRepos: array returned for org custom-property pagination
 * - extend: fn(github, rec) to add further endpoints
 */
export function makeMockGithub ({
  alertsByRepo = {},
  graphqlBody = null,
  propertyRepos = null,
  pullHeadSha = 'abc1234',
  extend
} = {}) {
  const rec = new Recorder()
  const github = {
    __recorder: rec,
    paginate: async (url, opts = {}) => {
      rec.record('paginate', { url: String(url), opts })
      const key = `${opts.owner}/${opts.repo}`
      if (key in alertsByRepo) return alertsByRepo[key]
      if (propertyRepos !== null && String(url).includes('properties/values')) return propertyRepos
      return []
    },
    graphql: async (query, variables) => {
      rec.record('graphql', { query: String(query).slice(0, 60), variables })
      return graphqlBody || { repository: { pullRequest: { reviewThreads: { nodes: [] } } } }
    },
    rest: {
      pulls: {
        get: async (params) => {
          rec.record('pulls.get', params)
          return { data: { head: { sha: pullHeadSha } } }
        },
        createReviewComment: async (params) => {
          rec.record('createReviewComment', params)
          return { data: { id: 1 } }
        },
        listFiles: async (params) => {
          rec.record('pulls.listFiles', params)
          return { data: [] }
        }
      },
      issues: {
        createComment: async (params) => {
          rec.record('issues.createComment', params)
          return { data: { id: 1 } }
        },
        listComments: async (params) => {
          rec.record('issues.listComments', params)
          return { data: [] }
        },
        updateComment: async (params) => {
          rec.record('issues.updateComment', params)
          return { data: {} }
        },
        deleteComment: async (params) => {
          rec.record('issues.deleteComment', params)
          return { data: {} }
        }
      }
    }
  }
  if (extend) extend(github, rec)
  return github
}

/** Fake @actions/github context object. */
export function makeMockContext (overrides = {}) {
  return {
    repo: { owner: 'test-org', repo: 'test-repo' },
    issue: { number: 42 },
    ...overrides
  }
}

/** Fake @actions/core. Calls recorded on core.__recorder. */
export function makeMockCore () {
  const rec = new Recorder()
  const core = {
    __recorder: rec,
    info: (msg) => rec.record('info', { msg }),
    debug: (msg) => rec.record('debug', { msg }),
    warning: (msg) => rec.record('warning', { msg }),
    error: (msg) => rec.record('error', { msg }),
    notice: (msg) => rec.record('notice', { msg }),
    setFailed: (msg) => rec.record('setFailed', { msg }),
    setOutput: (name, value) => rec.record('setOutput', { name, value })
  }
  return core
}

/** Fixed-result spawn replacement for modules accepting an _spawn seam. */
export function makeMockSpawn (result = { stdout: '', stderr: '' }) {
  const rec = new Recorder()
  const spawn = async (...args) => {
    rec.record('spawn', { args })
    return result
  }
  spawn.__recorder = rec
  return spawn
}

class CustomWorld extends World {
  constructor (options) {
    super(options)
    this.params = {}
    this.result = null
    this.error = null
  }

  async attempt (fn) {
    this.error = null
    this.result = null
    try {
      this.result = await fn()
    } catch (err) {
      this.error = err
    }
  }
}

Object.assign(CustomWorld.prototype, {
  makeMockSlackWeb,
  makeMockGithub,
  makeMockContext,
  makeMockCore,
  makeMockSpawn,
  Recorder
})

setWorldConstructor(CustomWorld)
