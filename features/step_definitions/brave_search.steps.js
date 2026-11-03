import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { createBraveSearch } from '../../src/triage/harness/braveSearch.js'

function braveBody (results) {
  return JSON.stringify({
    web: {
      results: results.map((r, i) => ({
        title: `Result ${i + 1}`,
        url: r.url ?? `https://example.com/${i + 1}`,
        description: r.description ?? `desc ${i + 1}`,
        age: r.age ?? '2 days ago'
      }))
    }
  })
}

Given('a fake HTTP transport', function () {
  this.params.braveRequests = []
  this.fetchImpl = async (url, init) => {
    this.params.braveRequests.push({ url: String(url), headers: init?.headers ?? {} })
    const status = this.params.braveStatus ?? 200
    const body = this.params.braveBody ?? '[]'
    return { ok: status >= 200 && status < 300, status, text: async () => body }
  }
  this.runSearch = async ({ query, count }) => {
    try {
      const search = createBraveSearch({ apiKey: 'brave-key-1', fetchImpl: this.fetchImpl }).search
      this.params.searchOutput = await search({ query, count })
    } catch (err) {
      this.params.searchError = err
    }
  }
})

Given('the Brave API returns {int} results', function (n) {
  this.params.braveBody = braveBody(Array.from({ length: n }, (_, i) => ({
    url: i === 0 ? 'https://example.com/cve' : `https://example.com/${i + 1}`
  })))
})

Given('the Brave API returns no results', function () {
  this.params.braveBody = braveBody([])
})

Given('the Brave API returns status {int}', function (status) {
  this.params.braveStatus = status
  this.params.braveBody = status === 401 ? 'unauthorized' : 'error'
})

When('the search tool runs with query {string}', async function (query) {
  await this.runSearch({ query })
})

When('the search tool runs with query {string} and count {int}', async function (query, count) {
  await this.runSearch({ query, count })
})

When('createBraveSearch is called without an api key', function () {
  try {
    createBraveSearch({ apiKey: undefined, fetchImpl: this.fetchImpl })
    this.params.createError = null
  } catch (err) {
    this.params.createError = err
  }
})

Then('the search output lists {int} numbered results', function (n) {
  const out = this.params.searchOutput
  for (let i = 1; i <= n; i++) assert.ok(out.includes(`${i}. `), `missing ${i}.`)
})

Then('the search output contains {string}', function (needle) {
  assert.ok(this.params.searchOutput.includes(needle))
})

Then('the search output is {string}', function (expected) {
  assert.equal(this.params.searchOutput, expected)
})

Then('the search tool fails with error {string}', function (expected) {
  assert.equal(this.params.searchError?.message, expected)
})

Then('creation fails with error {string}', function (expected) {
  assert.equal(this.params.createError?.message, expected)
})

Then('the request URL contains {string}', function (needle) {
  const urls = this.params.braveRequests.map(r => r.url)
  assert.ok(urls.some(u => u.includes(needle)), `no request URL contains ${needle}; got ${urls}`)
})

Then('the request carries header {string} with value {string}', function (name, value) {
  const req = this.params.braveRequests[0]
  assert.equal(req.headers[name], value)
})
