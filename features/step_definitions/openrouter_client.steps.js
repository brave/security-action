import { Given, When, Then, Before } from '@cucumber/cucumber'
import assert from 'assert'
import { createOpenRouterClient } from '../../src/openrouterClient.js'

// Fixtures mirror manually captured real OpenRouter responses
// (z-ai/glm-5.3-flash, captured 2026-10-28, see tmp/openrouter-chat-capture*.json).

const SUCCESS_BODY = {
  id: 'gen-1793230377-k8tvm',
  object: 'chat.completion',
  created: 1793230377,
  model: 'z-ai/glm-5.3-flash',
  provider: 'Zhipu',
  choices: [{
    index: 0,
    logprobs: null,
    finish_reason: 'stop',
    native_finish_reason: 'stop',
    message: {
      role: 'assistant',
      content: '{"label":"UNKNOWN","confidence_score":0.0}',
      refusal: null,
      reasoning: 'Trivial reply.',
      reasoning_details: []
    }
  }],
  usage: {
    prompt_tokens: 33,
    completion_tokens: 116,
    total_tokens: 149,
    cost: 0.00006295,
    is_byok: false,
    prompt_tokens_details: { cached_tokens: 0, cache_write_tokens: 0, audio_tokens: 0, video_tokens: 0 },
    completion_tokens_details: { reasoning_tokens: 102, image_tokens: 0, audio_tokens: 0 }
  }
}

const LENGTH_BODY = {
  ...SUCCESS_BODY,
  choices: [{
    ...SUCCESS_BODY.choices[0],
    finish_reason: 'length',
    native_finish_reason: 'length',
    message: {
      role: 'assistant',
      content: null,
      refusal: null,
      reasoning: 'The user is asking me to reply with exactly a specific JSON string and nothing else. This is a simple, benign request.',
      reasoning_details: []
    }
  }],
  usage: {
    ...SUCCESS_BODY.usage,
    completion_tokens: 100,
    total_tokens: 133,
    cost: 0.00005495,
    completion_tokens_details: { reasoning_tokens: 100, image_tokens: 0, audio_tokens: 0 }
  }
}

const ERROR_400_BODY = {
  error: {
    message: 'Reasoning is mandatory for this endpoint and cannot be disabled.',
    code: 400,
    metadata: { provider_name: null }
  }
}

function makeTransport (script) {
  const requests = []
  let call = 0
  const transport = async (url, init) => {
    requests.push({ url, init })
    const step = script[Math.min(call, script.length - 1)]
    call++
    if (step.kind === 'http-error') {
      return new Response(JSON.stringify(step.body ?? ERROR_400_BODY), {
        status: step.status,
        headers: { 'content-type': 'application/json' }
      })
    }
    if (step.kind === 'network-error') {
      throw new Error(step.message)
    }
    return new Response(JSON.stringify(step.body), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  }
  transport.__requests = requests
  transport.__callCount = () => call
  return transport
}

Before(function () {
  this.lastResult = null
  this.lastError = null
  this.sleeps = []
})

Given('an OpenRouter client with a fake transport', function () {
  this.transport = makeTransport([{ kind: 'ok', body: SUCCESS_BODY }])
  this.client = createOpenRouterClient({
    apiKey: 'sk-or-v1-test',
    fetchImpl: this.transport,
    sleep: async (ms) => { this.sleeps.push(ms) }
  })
})

Given('the captured response fixture shape', function () {
  // documents intent; fixtures defined above
})

Given('a session budget of {float} usd', function (budgetUsd) {
  this.budgetUsd = budgetUsd
})

Given('the session already spent {float} usd', function (amount) {
  this.client = createOpenRouterClient({
    apiKey: 'sk-or-v1-test',
    fetchImpl: this.transport,
    sleep: async (ms) => { this.sleeps.push(ms) },
    initialSpendUsd: amount,
    budgetUsd: this.budgetUsd
  })
})

function bodyOf (init) {
  return JSON.parse(init.body)
}

When('the client completes a chat request for model {string}', async function (model) {
  try {
    this.lastResult = await this.client.chat({
      model,
      messages: [{ role: 'user', content: 'Reply with exactly this JSON and nothing else: {"label":"UNKNOWN","confidence_score":0.0}' }],
      maxTokens: 2000,
      temperature: 0
    })
  } catch (err) {
    this.lastError = err
  }
})

When('the client completes a chat request for model {string} with temperature {int}', async function (model, temperature) {
  try {
    this.lastResult = await this.client.chat({
      model,
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      temperature
    })
  } catch (err) {
    this.lastError = err
  }
})

When('the client completes a chat request for model {string} with reasoning effort {string}', async function (model, effort) {
  try {
    this.lastResult = await this.client.chat({
      model,
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      temperature: 0,
      reasoning: { effort }
    })
  } catch (err) {
    this.lastError = err
  }
})

When('the client completes a chat request with tools', async function () {
  try {
    this.lastResult = await this.client.chat({
      model: 'z-ai/glm-5.3-flash',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      tools: [{ type: 'function', function: { name: 'view' } }]
    })
  } catch (err) {
    this.lastError = err
  }
})

Then('the request body contains reasoning {string}', function (expected) {
  const body = JSON.parse(this.transport.__requests[0].init.body)
  assert.deepEqual(body.reasoning, JSON.parse(expected))
})

Then('the request body contains tools {string}', function (expected) {
  const body = JSON.parse(this.transport.__requests[0].init.body)
  assert.deepEqual(body.tools, JSON.parse(expected))
})

Then('the request body contains tool choice {string}', function (expected) {
  const body = JSON.parse(this.transport.__requests[0].init.body)
  assert.equal(body.tool_choice, expected)
})

When('the client receives a completion with null content and finish reason {string}', async function (_reason) {
  this.transport = makeTransport([{ kind: 'ok', body: LENGTH_BODY }])
  this.client = createOpenRouterClient({
    apiKey: 'sk-or-v1-test',
    fetchImpl: this.transport,
    sleep: async (ms) => { this.sleeps.push(ms) }
  })
  this.lastResult = await this.client.chat({
    model: 'z-ai/glm-5.3-flash',
    messages: [{ role: 'user', content: 'hi' }],
    maxTokens: 100,
    temperature: 0
  })
})

When('the transport answers {int} with {string}', async function (status, message) {
  this.transport = makeTransport([{ kind: 'http-error', status, body: { error: { message, code: status, metadata: { provider_name: null } } } }])
  this.client = createOpenRouterClient({
    apiKey: 'sk-or-v1-test',
    fetchImpl: this.transport,
    sleep: async (ms) => { this.sleeps.push(ms) }
  })
  try {
    this.lastResult = await this.client.chat({
      model: 'z-ai/glm-5.3-flash',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      temperature: 0
    })
  } catch (err) {
    this.lastError = err
  }
})

When('the transport answers {int} once and then a successful completion', async function (status) {
  this.transport = makeTransport([
    { kind: 'http-error', status, body: { error: { message: 'rate limited', code: status, metadata: {} } } },
    { kind: 'ok', body: SUCCESS_BODY }
  ])
  this.client = createOpenRouterClient({
    apiKey: 'sk-or-v1-test',
    fetchImpl: this.transport,
    sleep: async (ms) => { this.sleeps.push(ms) }
  })
  try {
    this.lastResult = await this.client.chat({
      model: 'z-ai/glm-5.3-flash',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      temperature: 0
    })
  } catch (err) {
    this.lastError = err
  }
})

When('the transport answers {int} three times', async function (status) {
  this.transport = makeTransport([
    { kind: 'http-error', status, body: { error: { message: 'unavailable', code: status, metadata: {} } } }
  ])
  this.client = createOpenRouterClient({
    apiKey: 'sk-or-v1-test',
    fetchImpl: this.transport,
    sleep: async (ms) => { this.sleeps.push(ms) }
  })
  try {
    this.lastResult = await this.client.chat({
      model: 'z-ai/glm-5.3-flash',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      temperature: 0
    })
  } catch (err) {
    this.lastError = err
  }
})

When('the transport throws {string} once and then a successful completion', async function (message) {
  this.transport = makeTransport([
    { kind: 'network-error', message },
    { kind: 'ok', body: SUCCESS_BODY }
  ])
  this.client = createOpenRouterClient({
    apiKey: 'sk-or-v1-test',
    fetchImpl: this.transport,
    sleep: async (ms) => { this.sleeps.push(ms) }
  })
  try {
    this.lastResult = await this.client.chat({
      model: 'z-ai/glm-5.3-flash',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      temperature: 0
    })
  } catch (err) {
    this.lastError = err
  }
})

When('the client attempts another chat request', async function () {
  try {
    this.lastResult = await this.client.chat({
      model: 'z-ai/glm-5.3-flash',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      temperature: 0
    })
  } catch (err) {
    this.lastError = err
  }
})

When('the client completes {int} chat requests costing {float} usd each', async function (count, cost) {
  const body = { ...SUCCESS_BODY, usage: { ...SUCCESS_BODY.usage, cost } }
  this.transport = makeTransport([{ kind: 'ok', body }])
  this.client = createOpenRouterClient({
    apiKey: 'sk-or-v1-test',
    fetchImpl: this.transport,
    sleep: async (ms) => { this.sleeps.push(ms) }
  })
  for (let i = 0; i < count; i++) {
    await this.client.chat({
      model: 'z-ai/glm-5.3-flash',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 2000,
      temperature: 0
    })
  }
})

Then('the result content is {string}', function (expected) {
  assert.strictEqual(this.lastResult.content, expected === 'null' ? null : expected)
})

Then('the result content is null', function () {
  assert.strictEqual(this.lastResult.content, null)
})

Then('no error is thrown', function () {
  assert.strictEqual(this.lastError, null)
})

Then('the result finish reason is {string}', function (reason) {
  assert.strictEqual(this.lastResult.finishReason, reason)
})

Then('the result usage reports {int} prompt tokens and {int} completion tokens', function (promptTokens, completionTokens) {
  assert.strictEqual(this.lastResult.usage.promptTokens, promptTokens)
  assert.strictEqual(this.lastResult.usage.completionTokens, completionTokens)
})

Then('the result usage reports {int} reasoning tokens', function (reasoningTokens) {
  assert.strictEqual(this.lastResult.usage.reasoningTokens, reasoningTokens)
})

Then('the result usage cost is {float} usd', function (cost) {
  assert.strictEqual(this.lastResult.usage.cost, cost)
})

Then('a ProviderError is thrown', function () {
  assert.ok(this.lastError, 'expected an error')
  assert.strictEqual(this.lastError.name, 'ProviderError')
})

Then('a ProviderError is thrown with message {string}', function (message) {
  assert.ok(this.lastError, 'expected an error')
  assert.strictEqual(this.lastError.name, 'ProviderError')
  assert.strictEqual(this.lastError.message, message)
})

Then('a BudgetExceededError is thrown', function () {
  assert.ok(this.lastError, 'expected an error')
  assert.strictEqual(this.lastError.name, 'BudgetExceededError')
})

Then('the transport received exactly {int} request(s)', function (count) {
  assert.strictEqual(this.transport.__callCount(), count)
})

Then('the client slept before the retry', function () {
  assert.ok(this.sleeps.length > 0, 'expected at least one backoff sleep')
})

Then('the session spend is {float} usd', function (expected) {
  assert.ok(Math.abs(this.client.totalSpendUsd - expected) < 1e-12, `spend ${this.client.totalSpendUsd} != ${expected}`)
})

Then('the request had header {string} starting with {string}', function (header, prefix) {
  const init = this.transport.__requests[0].init
  const value = init.headers[header] ?? init.headers[header.toLowerCase()]
  assert.ok(value.startsWith(prefix), `header ${header}=${value} does not start with ${prefix}`)
})

Then('the request body model is {string}', function (model) {
  assert.strictEqual(bodyOf(this.transport.__requests[0].init).model, model)
})

Then('the request body temperature is {int}', function (temperature) {
  assert.strictEqual(bodyOf(this.transport.__requests[0].init).temperature, temperature)
})
