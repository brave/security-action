import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { runBenchmark } from '../../src/triage/runner.js'
import { BudgetExceededError, ProviderError } from '../../src/openrouterClient.js'

const CASE_A = {
  case_id: 'case_a',
  folder_root: '/root/analysis/BenchmarkJava',
  scan_root: '.',
  tool: ['Scanner'],
  file: 'src/A.java',
  raw_output: { Scanner: [{ ruleId: 'java/xss', message: { text: 'x' } }] }
}

function makeItem (caseId, label) {
  return {
    caseId,
    dataset: 'owasp',
    label,
    cwe: '79',
    caseJson: { ...CASE_A, case_id: caseId, file: `src/${caseId}.java` },
    repoRoot: '/repo'
  }
}

const GOOD_VERDICT = JSON.stringify({
  label: 'FP',
  confidence: 'medium',
  confidence_score: 0.7,
  reason: 'sanitized',
  evidence: [{ file: 'src/A.java', lines: 'L1', note: 'n' }]
})

Given('a queue with {int} item(s) rooted at {string}', function (n, root) {
  const labels = ['FP', 'TP', 'FP']
  this.params.queue = { items: Array.from({ length: n }, (_, i) => makeItem(`case_${i}`, labels[i % 3])), skipped: [] }
  this.params.queue.items.forEach(i => { i.repoRoot = root })
})

Given('a queue with {int} item(s)', makeItemQueue)
function makeItemQueue (n) {
  this.params.queue = { items: Array.from({ length: n }, (_, i) => makeItem(`case_${i}`, i === 0 ? 'FP' : 'TP')), skipped: [] }
}

Given('a scripted model that calls view then done', function () {
  this.params.chatCalls = []
  this.chat = async ({ messages }) => {
    this.params.chatCalls.push(messages.length)
    if (this.params.chatCalls.length % 2 === 1) {
      return {
        content: null,
        finishReason: 'tool_calls',
        usage: { prompt_tokens: 100, completion_tokens: 10, cost: 0.0005 },
        toolCalls: [{ id: `c${this.params.chatCalls.length}`, name: 'view', arguments: JSON.stringify({ file: 'src/A.java' }) }]
      }
    }
    return {
      content: null,
      finishReason: 'tool_calls',
      usage: { prompt_tokens: 100, completion_tokens: 20, cost: 0.0005 },
      toolCalls: [{ id: `d${this.params.chatCalls.length}`, name: 'done', arguments: GOOD_VERDICT }]
    }
  }
  this.params.fsFiles = { '/repo/src/case_0.java': 'class A {}', '/repo/src/case_1.java': 'class B {}', '/repo/src/case_2.java': 'class C {}' }
})

Given('a scripted model that answers a plain-content verdict', function () {
  this.params.chatCalls = []
  this.chat = async () => {
    this.params.chatCalls.push(1)
    return { content: GOOD_VERDICT, finishReason: 'stop', usage: { prompt_tokens: 50, completion_tokens: 10, cost: 0.0002 } }
  }
})

Given('a scripted model that answers invalid content', function () {
  this.params.chatCalls = []
  this.chat = async () => {
    this.params.chatCalls.push(1)
    return { content: 'not a verdict at all', finishReason: 'stop', usage: { prompt_tokens: 50, completion_tokens: 10, cost: 0.0002 } }
  }
})

Given('a scripted model that answers a camelCase-usage verdict', function () {
  this.params.chatCalls = []
  this.chat = async () => {
    this.params.chatCalls.push(1)
    return { content: GOOD_VERDICT, finishReason: 'stop', usage: { promptTokens: 150, completionTokens: 40, costUsd: 0.005 } }
  }
})

Given('a scripted model that raises provider error on item {int}', function (itemNo) {
  this.params.chatCalls = []
  this.chat = async () => {
    this.params.chatCalls.push(1)
    if (this.params.chatCalls.length === itemNo) throw new ProviderError('boom', { status: 500, code: 'server_error' })
    return { content: GOOD_VERDICT, finishReason: 'stop', usage: { prompt_tokens: 50, completion_tokens: 10, cost: 0.0002 } }
  }
})

Given('a scripted model that spends more per call', function () {
  this.params.chatCalls = []
  this.chat = async () => {
    this.params.chatCalls.push(1)
    if (this.params.budgetExhausted) throw new BudgetExceededError('session budget exceeded')
    this.params.spent = (this.params.spent ?? 0) + 0.0005
    if (this.params.spent > (this.params.budgetUsd ?? Infinity)) this.params.budgetExhausted = true
    return { content: GOOD_VERDICT, finishReason: 'stop', usage: { prompt_tokens: 50, completion_tokens: 10, cost: 0.0005 } }
  }
})

Given('a scripted model that calls done immediately', function () {
  this.params.chatCalls = []
  this.chat = async () => {
    this.params.chatCalls.push(1)
    return {
      content: null,
      finishReason: 'tool_calls',
      usage: { prompt_tokens: 50, completion_tokens: 10, cost: 0.0001 },
      toolCalls: [{ id: 'd1', name: 'done', arguments: GOOD_VERDICT }]
    }
  }
})

Given('a model budget of {float} usd', function (budgetUsd) {
  this.params.budgetUsd = budgetUsd
})

Given('a repo file {string} containing {string}', function (p, content) {
  this.params.fsFiles = { [`/repo${p}`]: content }
})

Then('the first request content contains {string}', function (needle) {
  const body = this.params.firstRequestBody
  assert.ok(String(body).includes(needle), `request content should include ${needle}`)
})

Then('the run result usage is {int} prompt token(s) and {int} completion token(s)', function (p, c) {
  const usage = this.params.run.results[0].usage
  assert.equal(usage.promptTokens, p)
  assert.equal(usage.completionTokens, c)
})

Then('the run result cost is {float} usd', function (cost) {
  assert.ok(Math.abs(this.params.run.results[0].usage.cost - cost) < 1e-9)
})

Given('an agentic runner with max turns {int}', function (maxTurns) {
  this.params.maxTurns = maxTurns
  this.params.mode = 'agentic'
})

Given('a scripted model that calls reach then done', function () {
  this.params.chatCalls = []
  this.chat = async ({ messages }) => {
    this.params.chatCalls.push(JSON.stringify(messages))
    if (this.params.chatCalls.length === 1) {
      return {
        content: null,
        finishReason: 'tool_calls',
        usage: { prompt_tokens: 100, completion_tokens: 10, cost: 0.0005 },
        toolCalls: [{ id: 'r1', name: 'reach', arguments: JSON.stringify({ file: 'src/A.java', line: 5, ruleId: 'java/xss' }) }]
      }
    }
    return {
      content: null,
      finishReason: 'tool_calls',
      usage: { prompt_tokens: 100, completion_tokens: 20, cost: 0.0005 },
      toolCalls: [{ id: 'd1', name: 'done', arguments: GOOD_VERDICT }]
    }
  }
  this.params.fsFiles = { '/repo/src/case_0.java': 'class A {}' }
})

Given('an agentic runner with max turns {int} and reach', function (maxTurns) {
  this.params.maxTurns = maxTurns
  this.params.mode = 'agentic'
  this.params.reachCalls = []
  this.params.makeReach = (item) => {
    this.params.reachItem = item
    return async (args) => {
      this.params.reachCalls.push(args)
      return { ok: true, output: 'enclosing function doPost (/repo/src/case_0.java:39)\ncallers (0)\nreachable from entry doPost: yes (doPost)' }
    }
  }
})

Then('the reach fake was called with rule {string}', function (ruleId) {
  assert.equal(this.params.reachCalls[0]?.ruleId, ruleId)
})

Then('the reach tool bound to the queue item', function () {
  assert.equal(this.params.reachItem?.caseId, 'case_0')
})

Then('the later request bodies contain {string}', function (needle) {
  const later = this.params.chatCalls.slice(1).join('\n')
  assert.ok(later.includes(needle), `later requests should include ${needle}`)
})

Given('a vanilla runner', function () {
  this.params.mode = 'vanilla'
})

When('the runner executes the queue', async function () {
  const outPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'runner-')), 'results.jsonl')
  this.params.outPath = outPath
  const makeFsi = (repoRoot) => ({
    readFileSync: (p) => {
      if (!(p in this.params.fsFiles)) throw new Error(`file not found: ${p}`)
      return this.params.fsFiles[p]
    },
    readdirSync: (dir) => {
      if (dir !== '/repo') throw new Error(`not a directory: ${dir}`)
      return ['src']
    }
  })
  const origChat = this.chat
  const wrappedChat = async (arg) => {
    if (this.params.chatCalls.length === 0) this.params.firstRequestBody = JSON.stringify(arg.messages)
    return origChat(arg)
  }
  this.params.run = await runBenchmark({
    queue: this.params.queue,
    chat: wrappedChat,
    model: 'fake-model',
    mode: this.params.mode ?? 'agentic',
    maxTurns: this.params.maxTurns ?? 8,
    initialSpendUsd: this.params.spent ?? 0,
    budgetUsd: this.params.budgetUsd,
    makeFsi,
    makeReach: this.params.makeReach ?? null,
    agent: 'swe-agent',
    outPath: this.params.outPath
  })
})

Then('the run yields {int} result(s)', function (n) {
  assert.equal(this.params.run.results.length, n)
})

Then('every result has a verdict label', function () {
  for (const r of this.params.run.results) assert.ok(['FP', 'TP', 'UNKNOWN'].includes(r.verdict.label))
})

Then('the results keep queue order', function () {
  assert.deepEqual(this.params.run.results.map(r => r.caseId), this.params.queue.items.map(i => i.caseId))
})

Then('exactly {int} model request(s) made', function (n) {
  assert.equal(this.params.chatCalls.length, n)
})

Then('the result verdict label is {string}', function (label) {
  assert.equal(this.params.run.results[0].verdict.label, label)
})

Then('item {int} is UNKNOWN with stop reason {string}', function (itemNo, stopped) {
  const r = this.params.run.results[itemNo - 1]
  assert.equal(r.verdict.label, 'UNKNOWN')
  assert.equal(r.stopped, stopped)
})

Then('items {int} and {int} have non-UNKNOWN verdicts', function (a, b) {
  for (const i of [a, b]) assert.notEqual(this.params.run.results[i - 1].verdict.label, 'UNKNOWN')
})

Then('the drained results are UNKNOWN with stop reason {string}', function (stopped) {
  const drained = this.params.run.results.filter(r => r.stopped === stopped && r.verdict.label === 'UNKNOWN')
  assert.ok(drained.length >= 1, `expected drained results, got ${JSON.stringify(this.params.run.results.map(r => [r.stopped, r.verdict.label]))}`)
})

Then('the JSONL artifact has {int} lines in queue order', function (n) {
  const lines = fs.readFileSync(this.params.outPath, 'utf8').trim().split('\n')
  assert.equal(lines.length, n)
  assert.deepEqual(lines.map(l => JSON.parse(l).caseId), this.params.queue.items.map(i => i.caseId))
})
