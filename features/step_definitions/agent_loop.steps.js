import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { runAgent } from '../../src/triage/harness/agent.js'
import { createToolRegistry } from '../../src/triage/harness/tools.js'
import { ProviderError, BudgetExceededError } from '../../src/openrouterClient.js'

Given('a fake model client', function () {
  this.params.script = []
  this.params.requests = []
  this.chat = async ({ model, messages }) => {
    this.params.requests.push({ model, messages: messages.map(m => ({ ...m })) })
    const step = this.params.script.shift()
    if (!step) throw new Error('fake model client: script exhausted')
    if (step.throwProvider) throw new ProviderError(step.throwProvider, { status: 500, code: 'server_error' })
    if (step.throwBudget) throw new BudgetExceededError(step.throwBudget)
    if (step.raw) {
      return {
        content: null,
        finishReason: 'tool_calls',
        usage: { prompt_tokens: 10, completion_tokens: 2, cost: 0.0001 },
        raw: step.raw
      }
    }
    if (step.camelUsage) {
      return {
        content: step.content ?? null,
        finishReason: 'stop',
        usage: step.camelUsage,
        toolCalls: []
      }
    }
    return {
      content: step.content ?? null,
      finishReason: step.tool ? 'tool_calls' : 'stop',
      usage: {
        prompt_tokens: step.prompt_tokens ?? 0,
        completion_tokens: step.completion_tokens ?? 0,
        cost: step.cost ?? 0
      },
      toolCalls: step.tool
        ? [{ id: `call_${step.call}`, name: step.tool, arguments: step.arguments ?? '{}' }]
        : []
    }
  }
})

Given('a triage task {string} with case_id {string}', function (task, caseId) {
  this.params.task = task
  this.params.caseId = caseId
})

Given('the model script:', function (table) {
  this.params.script = table.hashes().map(row => ({
    call: Number(row.call),
    tool: row.tool || null,
    arguments: row.arguments ?? '',
    prompt_tokens: row.prompt_tokens ? Number(row.prompt_tokens) : undefined,
    completion_tokens: row.completion_tokens ? Number(row.completion_tokens) : undefined,
    cost: row.cost ? Number(row.cost) : undefined
  }))
})

Given('the model script raises provider error {string}', function (message) {
  this.params.script = [{ throwProvider: message }]
})

Given('the model script raises budget error {string}', function (message) {
  this.params.script = [{ throwBudget: message }]
})

Given('the model script returns plain-content verdict {string}', function (json) {
  this.params.script = [{ content: json }]
})

Given('the model script returns rambling content {string} then plain verdict {string}', function (ramble, json) {
  this.params.script = [{ content: ramble }, { content: json }]
})

Given('the model script returns done with malformed json {string} then plain verdict {string}', function (bad, json) {
  this.params.script = [{ tool: 'done', arguments: bad }, { content: json }]
})

Given('the model script calls view with malformed json {string} then plain verdict {string}', function (bad, json) {
  this.params.script = [{ tool: 'view', arguments: bad }, { content: json }]
})

Given('the model script returns raw OpenAI tool calls:', function (json) {
  this.params.script = [{ raw: JSON.parse(json) }]
})

Given('a plain verdict follows {string}', function (json) {
  this.params.script.push({ content: json })
})

Given('the model script returns camelCase-usage verdict {string} using {int} prompt and {int} completion tokens at {float} usd', function (json, prompt, completion, cost) {
  this.params.script = [{ content: json, camelUsage: { promptTokens: prompt, completionTokens: completion, costUsd: cost } }]
})

Given('a view tool bound to the repo root', function () {
  this.registry = createToolRegistry({
    root: this.params.repoRoot,
    fsi: {
      readFileSync: (path) => {
        if (!(path in this.fsFiles)) throw new Error(`file not found: ${path}`)
        return this.fsFiles[path]
      },
      readdirSync: (dir) => {
        if (dir !== this.params.repoRoot) throw new Error(`not a directory: ${dir}`)
        const names = new Set()
        for (const key of Object.keys(this.fsFiles)) {
          names.add(key.slice(this.params.repoRoot.length + 1).split('/')[0])
        }
        return [...names]
      }
    },
    exec: null
  })
})

Given('the agent max turns is {int}', function (maxTurns) {
  this.params.maxTurns = maxTurns
})

When('the agent runs', async function () {
  await this.attempt(() => runAgent({
    chat: this.chat,
    model: this.params.model ?? 'fake-model',
    task: this.params.task ?? 'task markdown',
    caseId: this.params.caseId ?? 'BenchmarkTest00009',
    tools: this.registry,
    maxTurns: this.params.maxTurns
  }))
  this.params.run = this.result ?? this.error
})

When('the agent runs with system prompt {string}', async function (systemPrompt) {
  this.params.run = await runAgent({
    chat: this.chat,
    model: 'fake-model',
    task: 'task markdown',
    caseId: 'BenchmarkTest00009',
    tools: this.registry,
    systemPrompt
  })
})

Then('the run stops with reason {string}', function (reason) {
  assert.equal(this.params.run.stopped, reason)
})

Then('the run verdict label is {string}', function (label) {
  assert.equal(this.params.run.verdict.label, label)
})

Then('the run verdict confidence is {string}', function (confidence) {
  assert.equal(this.params.run.verdict.confidence, confidence)
})

Then('the run verdict reason contains {string}', function (needle) {
  assert.ok(this.params.run.verdict.reason.includes(needle))
})

Then('the loop took {int} turn(s)', function (turns) {
  assert.equal(this.params.run.turns, turns)
})

Then('the messages sent to the model include a tool result containing {string}', function (needle) {
  const found = this.params.requests.some(req =>
    req.messages.some(m => m.role === 'tool' && String(m.content).includes(needle))
  )
  assert.ok(found, `no tool result message includes ${needle}`)
})

Then('the messages sent to the model include a user nudge', function () {
  const found = this.params.requests.some(req =>
    req.messages.some(m => m.role === 'user' && m.content.includes('Return your final verdict through the done tool'))
  )
  assert.ok(found, 'no user nudge message found')
})

Then('the run usage is {int} prompt tokens and {int} completion tokens', function (promptTokens, completionTokens) {
  assert.equal(this.params.run.usage.promptTokens, promptTokens)
  assert.equal(this.params.run.usage.completionTokens, completionTokens)
})

Then('the run cost is {float} usd', function (cost) {
  assert.ok(Math.abs(this.params.run.usage.cost - cost) < 1e-9, `cost ${this.params.run.usage.cost} != ${cost}`)
})

Then('the run recorded {int} tool call(s)', function (count) {
  assert.equal(this.params.run.toolCalls, count)
})

Then('the first request messages start with a system message containing {string}', function (needle) {
  const first = this.params.requests[0].messages[0]
  assert.equal(first.role, 'system')
  assert.ok(first.content.includes(needle))
})

Then('the first request messages contain the task {string}', function (task) {
  const found = this.params.requests[0].messages.some(m => m.role === 'user' && m.content === task)
  assert.ok(found)
})
