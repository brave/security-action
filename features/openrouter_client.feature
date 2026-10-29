Feature: OpenRouter client
  Thin OpenAI-compatible chat-completions client for openrouter.ai used by the
  triage post-filter. Normalizes reasoning-model responses, tracks native cost
  per call, enforces a session budget and retries transient failures.
  Response/error shapes mirror manually captured real API responses
  (z-ai/glm-5.3-flash, 2026-10-28).

  Background:
    Given an OpenRouter client with a fake transport
    And the captured response fixture shape

  Scenario: Successful completion returns a normalized result
    When the client completes a chat request for model "z-ai/glm-5.3-flash"
    Then the result content is '{"label":"UNKNOWN","confidence_score":0.0}'
    And the result finish reason is "stop"
    And the result usage reports 33 prompt tokens and 116 completion tokens
    And the result usage reports 102 reasoning tokens
    And the result usage cost is 0.00006295 usd

  Scenario: Reasoning model with exhausted token budget returns null content
    When the client receives a completion with null content and finish reason "length"
    Then the result content is null
    And the result finish reason is "length"
    And no error is thrown

  Scenario: Provider 400 error is surfaced as a typed error without retry
    When the transport answers 400 with "Reasoning is mandatory for this endpoint and cannot be disabled."
    Then a ProviderError is thrown with message "Reasoning is mandatory for this endpoint and cannot be disabled."
    And the transport received exactly 1 request

  Scenario: Reasoning effort is forwarded in the request body
    When the client completes a chat request for model "z-ai/glm-5.3-flash" with reasoning effort "low"
    Then the request body contains reasoning '{"effort":"low"}'

  Scenario: Rate limit 429 is retried and then succeeds
    When the transport answers 429 once and then a successful completion
    Then the transport received exactly 2 requests
    And the result content is '{"label":"UNKNOWN","confidence_score":0.0}'
    And the client slept before the retry

  Scenario: Server 5xx errors are retried up to the limit
    When the transport answers 503 three times
    Then a ProviderError is thrown
    And the transport received exactly 4 requests

  Scenario: Network failure is retried and then succeeds
    When the transport throws "ECONNRESET" once and then a successful completion
    Then the transport received exactly 2 requests
    And the result content is '{"label":"UNKNOWN","confidence_score":0.0}'

  Scenario: Session budget is checked before a request
    Given a session budget of 0.01 usd
    And the session already spent 0.0101 usd
    When the client attempts another chat request
    Then a BudgetExceededError is thrown
    And the transport received exactly 0 requests

  Scenario: Cost of each call accumulates into the session spend
    When the client completes 3 chat requests costing 0.00006295 usd each
    Then the session spend is 0.00018885 usd

  Scenario: Requests carry the required headers and payload
    When the client completes a chat request for model "z-ai/glm-5.3-flash" with temperature 0
    Then the request had header "Authorization" starting with "Bearer sk-or-"
    And the request body model is "z-ai/glm-5.3-flash"
    And the request body temperature is 0
