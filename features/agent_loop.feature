Feature: Agentic triage loop
  As the agentic FP triage harness
  I want a multi-turn tool-calling agent loop around one finding
  So that the model gathers evidence iteratively before a verdict

  Background:
    Given a fake model client
    And a repo root "/repo" with file "src/App.java" containing:
      """
      class App { int f() { return 1; } }
      """
    And a view tool bound to the repo root
    And a triage task "task markdown" with case_id "BenchmarkTest00009"

  Scenario: Model calls done immediately
    Given the model script:
      | call | tool | arguments                                        |
      | 1    | done | {"label":"TP","confidence":"high","confidence_score":0.9,"reason":"obvious","evidence":[{"file":"src/App.java","lines":"L1-L5","note":"n"}]} |
    When the agent runs
    Then the run stops with reason "done"
    And the run verdict label is "TP"
    And the loop took 1 turn
  Scenario: Tool result is fed back and loop continues
    Given the model script:
      | call | tool | arguments                                     |
      | 1    | view | {"file":"src/App.java","startLine":1,"endLine":5} |
      | 2    | done | {"label":"FP","confidence":"medium","confidence_score":0.6,"reason":"benign","evidence":[{"file":"src/App.java","lines":"L1-L5","note":"n"}]} |
    When the agent runs
    Then the run stops with reason "done"
    And the loop took 2 turns
    And the messages sent to the model include a tool result containing "class App"

  Scenario: Unknown tool name produces an error result, not a crash
    Given the model script:
      | call | tool       | arguments        |
      | 1    | deploy_all | {}               |
      | 2    | done       | {"label":"UNKNOWN","confidence":"low","confidence_score":0.1,"reason":"cannot proceed","evidence":[]} |
    When the agent runs
    Then the run stops with reason "done"
    And the messages sent to the model include a tool result containing "Unknown tool"

  Scenario: Invalid verdict in done is fed back for retry
    Given the model script:
      | call | tool | arguments                       |
      | 1    | done | {"label":"MAYBE","reason":"x"}  |
      | 2    | done | {"label":"FP","confidence":"high","confidence_score":0.9,"reason":"ok","evidence":[{"file":"src/App.java","lines":"L1-L5","note":"n"}]} |
    When the agent runs
    Then the run stops with reason "done"
    And the loop took 2 turns
    And the messages sent to the model include a tool result containing "Invalid verdict"

  Scenario: Tool failure is fed back as an error result
    And the model script:
      | call | tool | arguments                            |
      | 1    | view | {"file":"missing.java"}              |
      | 2    | done | {"label":"UNKNOWN","confidence":"low","confidence_score":0.2,"reason":"file missing","evidence":[]} |
    When the agent runs
    Then the run stops with reason "done"
    And the messages sent to the model include a tool result containing "Tool error"

  Scenario: Max turns reached forces an UNKNOWN verdict
    Given the model script:
      | call | tool | arguments               |
      | 1    | view | {"file":"src/App.java"} |
      | 2    | view | {"file":"src/App.java"} |
    And the agent max turns is 2
    When the agent runs
    Then the run stops with reason "max_turns"
    And the run verdict label is "UNKNOWN"
    And the run verdict confidence is "low"

  Scenario: Model provider error stops the run with UNKNOWN
    Given the model script raises provider error "rate limited"
    When the agent runs
    Then the run stops with reason "error"
    And the run verdict label is "UNKNOWN"
    And the run verdict reason contains "rate limited"

  Scenario: Budget exhaustion stops the run with UNKNOWN
    Given the model script raises budget error "session budget of 0.01 usd exceeded"
    When the agent runs
    Then the run stops with reason "budget"
    And the run verdict label is "UNKNOWN"

  Scenario: Usage and turn metrics are accumulated
    Given the model script:
      | call | tool | arguments                                        | prompt_tokens | completion_tokens | cost |
      | 1    | view | {"file":"src/App.java"}                          | 100           | 20                | 0.001 |
      | 2    | done | {"label":"FP","confidence":"high","confidence_score":0.9,"reason":"ok","evidence":[{"file":"src/App.java","lines":"L1-L5","note":"n"}]} | 200 | 30 | 0.002 |
    When the agent runs
    Then the run stops with reason "done"
    And the run usage is 300 prompt tokens and 50 completion tokens
    And the run cost is 0.003 usd
    And the run recorded 1 tool call

  Scenario: First request carries system prompt and task
    Given the model script:
      | call | tool | arguments                                        |
      | 1    | done | {"label":"FP","confidence":"high","confidence_score":0.9,"reason":"ok","evidence":[{"file":"src/App.java","lines":"L1-L5","note":"n"}]} |
    When the agent runs with system prompt "security-oriented code reviewer"
    Then the first request messages start with a system message containing "security-oriented code reviewer"
    And the first request messages contain the task "task markdown"

  Scenario: Plain-content verdict is accepted without a tool call
    Given the model script returns plain-content verdict '{"label":"FP","confidence":"medium","confidence_score":0.5,"reason":"benign","evidence":[{"file":"src/App.java","lines":"L1","note":"n"}]}'
    When the agent runs
    Then the run stops with reason "done"
    And the run verdict label is "FP"
    And the run recorded 0 tool calls

  Scenario: Rambling content triggers a nudge and a retry
    Given the model script returns rambling content "I will look around first" then plain verdict '{"label":"TP","confidence":"medium","confidence_score":0.6,"reason":"reachable","evidence":[{"file":"src/App.java","lines":"L1","note":"n"}]}'
    When the agent runs
    Then the run stops with reason "done"
    And the run verdict label is "TP"
    And the loop took 2 turns
    And the messages sent to the model include a user nudge

  Scenario: Malformed done arguments are retried
    Given the model script returns done with malformed json "{oops" then plain verdict '{"label":"FP","confidence":"high","confidence_score":0.9,"reason":"ok","evidence":[{"file":"src/App.java","lines":"L1","note":"n"}]}'
    When the agent runs
    Then the run stops with reason "done"
    And the messages sent to the model include a tool result containing "Invalid verdict"

  Scenario: Malformed tool arguments degrade to empty arguments
    Given the model script calls view with malformed json "{oops" then plain verdict '{"label":"UNKNOWN","confidence":"low","confidence_score":0.1,"reason":"cannot inspect","evidence":[]}'
    When the agent runs
    Then the run stops with reason "done"
    And the messages sent to the model include a tool result containing "Tool error"

  Scenario: Raw OpenAI tool call shapes are normalized
    Given the model script returns raw OpenAI tool calls:
      """
      {"choices":[{"message":{"tool_calls":[{"id":"rc1","function":{"name":"view","arguments":"{\"file\":\"src/App.java\"}"}},{"bogus":true}]}}]}
      """
    And a plain verdict follows '{"label":"FP","confidence":"high","confidence_score":0.9,"reason":"ok","evidence":[{"file":"src/App.java","lines":"L1","note":"n"}]}'
    When the agent runs
    Then the run stops with reason "done"
    And the run verdict label is "FP"
    And the messages sent to the model include a tool result containing "class App"

  Scenario: camelCase usage keys are accumulated
    Given the model script returns camelCase-usage verdict '{"label":"FP","confidence":"high","confidence_score":0.9,"reason":"ok","evidence":[{"file":"src/App.java","lines":"L1","note":"n"}]}' using 150 prompt and 40 completion tokens at 0.005 usd
    When the agent runs
    Then the run stops with reason "done"
    And the run usage is 150 prompt tokens and 40 completion tokens
    And the run cost is 0.005 usd

  Scenario: Tool schemas are forwarded on every chat request
    Given the model script returns a plain verdict '{"label":"FP","confidence":"high","confidence_score":0.9,"reason":"ok","evidence":[{"file":"src/App.java","lines":"L1","note":"n"}]}'
    When the agent runs
    Then the run stops with reason "done"
    And every chat request carried the tool schemas view, grep, find, done
