import assert from 'assert'

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_BACKOFF_MS = 500

export class ProviderError extends Error {
  constructor (message, { status, code, body } = {}) {
    super(message)
    this.name = 'ProviderError'
    this.status = status
    this.code = code
    this.body = body
  }
}

export class BudgetExceededError extends Error {
  constructor (message) {
    super(message)
    this.name = 'BudgetExceededError'
  }
}

export class MissingApiKeyError extends Error {
  constructor () {
    super('OPENROUTER_API_KEY is required to create an OpenRouter client')
    this.name = 'MissingApiKeyError'
  }
}

function isTransientStatus (status) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599)
}

/**
 * Thin OpenAI-compatible chat-completions client for OpenRouter.
 *
 * - Normalizes reasoning-model responses (content may be null when the token
 *   budget is consumed by reasoning; callers decide how to react).
 * - Tracks native per-call cost (usage.cost) into a session spend.
 * - Enforces an optional session budget before each request.
 * - Retries transient failures (408/429/5xx, network errors) with backoff.
 */
export function createOpenRouterClient ({
  apiKey,
  baseUrl = DEFAULT_BASE_URL,
  fetchImpl = fetch,
  sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  maxRetries = DEFAULT_MAX_RETRIES,
  backoffMs = DEFAULT_BACKOFF_MS,
  budgetUsd = Infinity,
  initialSpendUsd = 0
} = {}) {
  if (!apiKey) throw new MissingApiKeyError()

  let totalSpendUsd = initialSpendUsd

  async function attempt (payload, { signal } = {}) {
    const init = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
    if (signal) init.signal = signal
    return fetchImpl(`${baseUrl}/chat/completions`, init)
  }

  function normalize (body) {
    const choice = body.choices[0]
    const usage = body.usage ?? {}
    const cost = usage.cost ?? 0
    totalSpendUsd += cost
    return {
      content: choice.message.content,
      reasoning: choice.message.reasoning ?? null,
      finishReason: choice.finish_reason,
      usage: {
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
        reasoningTokens: usage.completion_tokens_details?.reasoning_tokens ?? 0,
        cost
      },
      raw: body
    }
  }

  async function errorFromResponse (response) {
    let body = null
    let message = `OpenRouter request failed with status ${response.status}`
    try {
      body = await response.json()
      if (body?.error?.message) message = body.error.message
    } catch {
      // keep default message
    }
    return new ProviderError(message, { status: response.status, code: body?.error?.code, body })
  }

  return {
    get totalSpendUsd () {
      return totalSpendUsd
    },

    async chat ({
      model,
      messages,
      maxTokens,
      temperature = 0,
      signal,
      reasoning,
      tools,
      toolChoice = 'auto',
      retryLimit = maxRetries
    }) {
      assert.ok(model, 'model is required')
      assert.ok(Array.isArray(messages) && messages.length > 0, 'messages are required')

      if (totalSpendUsd >= budgetUsd) {
        throw new BudgetExceededError(
          `session budget exhausted: spent ${totalSpendUsd} >= budget ${budgetUsd}`
        )
      }

      const payload = { model, messages, max_tokens: maxTokens, temperature }
      if (reasoning) payload.reasoning = reasoning
      if (Array.isArray(tools)) {
        payload.tools = tools
        payload.tool_choice = toolChoice
      }

      let lastError = null
      for (let attemptNo = 0; attemptNo <= retryLimit; attemptNo++) {
        if (attemptNo > 0) {
          await sleep(backoffMs * attemptNo)
        }
        try {
          const response = await attempt(payload, { signal })
          if (response.ok) {
            return normalize(await response.json())
          }
          lastError = await errorFromResponse(response)
          if (!isTransientStatus(response.status)) {
            throw lastError
          }
        } catch (err) {
          if (err instanceof ProviderError && !isTransientStatus(err.status ?? 0)) {
            throw err
          }
          if (err.name === 'AbortError') {
            throw err
          }
          lastError = err
        }
      }
      throw lastError ?? new ProviderError('OpenRouter request failed')
    }
  }
}
