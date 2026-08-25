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
  chatDeleteOk = true,
  chatDeleteFailFor = []
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
        if (!chatDeleteOk || chatDeleteFailFor.includes(params.ts)) {
          throw new Error('cant_delete_message')
        }
        return { ok: true }
      }
    }
  }
  return web
}

/**
 * Fake Octokit instance covering the patterns used by src modules:
 * paginate (Dependabot alerts / repo properties / org endpoints), graphql
 * (review threads, timelines), repos.getContent and generic request.
 * All calls recorded on github.__recorder.
 *
 * - alertsByRepo: map 'owner/repo' -> array of alert objects
 * - orgAlerts: array returned for 'GET /orgs/{org}/dependabot/alerts'
 * - graphqlBody: object returned by every graphql call
 * - graphqlHandler: fn(query, variables) overriding graphqlBody
 * - propertyRepos: array returned for org custom-property pagination
 * - reposList: array for paginate(github.rest.repos.listForOrg)
 * - orgMembers: array for paginate(github.rest.orgs.listMembers)
 * - contributorsByRepo: map 'owner/repo' -> contributor arrays
 * - commitsByRepo: map 'owner/repo' -> commit arrays
 * - contentByPath: map 'owner/repo/path' -> string | object | { __error, message }
 * - requestHandler: fn(route, params) for github.request
 * - extend: fn(github, rec) to add further endpoints
 */
export function makeMockGithub ({
  alertsByRepo = {},
  orgAlerts = null,
  graphqlBody = null,
  graphqlHandler = null,
  propertyRepos = null,
  reposList = null,
  orgMembers = null,
  contributorsByRepo = {},
  commitsByRepo = {},
  contentByPath = {},
  requestHandler = null,
  pullHeadSha = 'abc1234',
  extend
} = {}) {
  const rec = new Recorder()
  const github = {
    __recorder: rec,
    paginate: async (url, opts = {}) => {
      rec.record('paginate', { url: String(url), opts })
      const key = `${opts.owner}/${opts.repo}`
      if (typeof url === 'function') {
        if (url === github.rest.repos.listForOrg) return reposList ?? []
        if (url === github.rest.orgs.listMembers) return orgMembers ?? []
        if (url === github.rest.repos.listContributors) return contributorsByRepo[key] ?? []
        if (url === github.rest.repos.listCommits) return commitsByRepo[key] ?? []
        return []
      }
      if (key in alertsByRepo) return alertsByRepo[key]
      if (orgAlerts !== null && String(url).includes('orgs/{org}/dependabot/alerts')) return orgAlerts
      if (propertyRepos !== null && String(url).includes('properties/values')) return propertyRepos
      return []
    },
    request: async (route, params = {}) => {
      rec.record('request', { route: String(route), params })
      if (requestHandler) return requestHandler(String(route), params)
      return { status: 204, data: {} }
    },
    graphql: async (query, variables) => {
      rec.record('graphql', { query: String(query), variables })
      if (graphqlHandler) return graphqlHandler(String(query), variables)
      return graphqlBody || { repository: { pullRequest: { reviewThreads: { nodes: [] } } } }
    },
    rest: {
      repos: {
        getContent: async (params) => {
          rec.record('repos.getContent', params)
          const key = `${params.owner}/${params.repo}/${params.path}`
          if (Object.prototype.hasOwnProperty.call(contentByPath, key)) {
            const val = contentByPath[key]
            if (val && val.__error) throw new Error(val.message || '404 Not Found')
            const text = typeof val === 'string' ? val : JSON.stringify(val)
            return { data: { content: Buffer.from(text).toString('base64') } }
          }
          throw new Error('404 Not Found')
        },
        listForOrg: async () => ({ data: [] }),
        listContributors: async () => ({ data: [] }),
        listCommits: async () => ({ data: [] })
      },
      orgs: {
        listMembers: async () => ({ data: [] })
      },
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
    setOutput: (name, value) => rec.record('setOutput', { name, value }),
    setSecret: (value) => rec.record('setSecret', { value })
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

/**
 * Fake exec seam for modules accepting an _exec injection.
 * handler(command, options) returns a string; throwing simulates command
 * failure. All commands recorded on exec.__recorder.
 */
export function makeMockExec (handler) {
  const rec = new Recorder()
  const exec = (command, options = {}) => {
    rec.record('exec', { command, options })
    return handler(command, options)
  }
  exec.__recorder = rec
  return exec
}

/**
 * In-memory fs seam: readFileSync / writeFileSync / appendFileSync /
 * existsSync / unlinkSync. Files map is shared (mutable) so writes are
 * later visible to reads. All calls recorded on fs.__recorder.
 */
export function makeMockFs (files = {}) {
  const rec = new Recorder()
  const key = (p) => String(p)
  const fsx = {
    __recorder: rec,
    __files: files,
    readFileSync: (p, enc) => {
      rec.record('readFileSync', { path: key(p), enc })
      if (!(key(p) in files)) throw new Error(`ENOENT: ${key(p)}`)
      return files[key(p)]
    },
    writeFileSync: (p, content, opts) => {
      rec.record('writeFileSync', { path: key(p), content, opts })
      files[key(p)] = content
    },
    appendFileSync: (p, content) => {
      rec.record('appendFileSync', { path: key(p), content })
      files[key(p)] = (files[key(p)] || '') + content
    },
    existsSync: (p) => {
      rec.record('existsSync', { path: key(p) })
      return key(p) in files
    },
    unlinkSync: (p) => {
      rec.record('unlinkSync', { path: key(p) })
      delete files[key(p)]
    }
  }
  return fsx
}

/** Fake download seam: async () -> Buffer, or throws when fail is set. */
export function makeMockDownload (content = 'fixture', { fail = null } = {}) {
  const rec = new Recorder()
  const download = async (url) => {
    rec.record('download', { url })
    if (fail) throw new Error(fail)
    return Buffer.from(content)
  }
  download.__recorder = rec
  return download
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
  makeMockExec,
  makeMockFs,
  makeMockDownload,
  Recorder
})

setWorldConstructor(CustomWorld)
