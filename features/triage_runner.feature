Feature: Benchmark runner
  As the Phase A benchmark runner
  I want to execute a queue against one model and collect labeled results
  So that bake-off metrics are computed from a single artifact file

  Scenario: Agentic run produces a result row per queue item
    Given a queue with 3 items rooted at "/repo"
    And a scripted model that calls view then done
    And an agentic runner with max turns 8
    When the runner executes the queue
    Then the run yields 3 results
    And every result has a verdict label
    And the results keep queue order

  Scenario: Vanilla mode makes a single direct call
    Given a queue with 1 item
    And a repo file "/src/case_0.java" containing "class A {}"
    And a scripted model that answers a plain-content verdict
    And a vanilla runner
    When the runner executes the queue
    Then the run yields 1 result
    And exactly 1 model request made
    And the result verdict label is "FP"
    And the first request content contains "class A {}"

  Scenario: Provider error marks the item UNKNOWN and continues
    Given a queue with 3 items
    And a scripted model that raises provider error on item 2
    When the runner executes the queue
    Then the run yields 3 results
    And item 2 is UNKNOWN with stop reason "error"
    And items 1 and 3 have non-UNKNOWN verdicts

  Scenario: Budget exhaustion drains the rest of the queue as UNKNOWN
    Given a queue with 3 items
    And a model budget of 0.001 usd
    And a scripted model that spends more per call
    When the runner executes the queue
    Then the run yields 3 results
    And the drained results are UNKNOWN with stop reason "budget"

  Scenario: Vanilla prompt includes the reported file content
    Given a queue with 1 item
    And a repo file "/src/case_0.java" containing "class A {}"
    And a scripted model that answers a plain-content verdict
    And a vanilla runner
    When the runner executes the queue
    Then the first request content contains "class A {}"

  Scenario: Vanilla invalid verdict content becomes UNKNOWN
    Given a queue with 1 item
    And a scripted model that answers invalid content
    And a vanilla runner
    When the runner executes the queue
    Then the run yields 1 result
    And item 1 is UNKNOWN with stop reason "error"

  Scenario: Vanilla camelCase usage keys are accumulated
    Given a queue with 1 item
    And a scripted model that answers a camelCase-usage verdict
    And a vanilla runner
    When the runner executes the queue
    Then the run result usage is 150 prompt tokens and 40 completion tokens
    And the run result cost is 0.005 usd

  Scenario: Vanilla model error marks the item UNKNOWN
    Given a queue with 1 item
    And a scripted model that raises provider error on item 1
    And a vanilla runner
    When the runner executes the queue
    Then item 1 is UNKNOWN with stop reason "error"

  Scenario: Results are appended to a JSONL artifact
    Given a queue with 2 items
    And a scripted model that calls done immediately
    When the runner executes the queue
    Then the JSONL artifact has 2 lines in queue order

  Scenario: Agentic run with reach exposes the reachability tool to the agent
    Given a queue with 1 item rooted at "/repo"
    And a scripted model that calls reach then done
    And an agentic runner with max turns 8 and reach
    When the runner executes the queue
    Then the run yields 1 result
    And the result verdict label is "FP"
    And the reach fake was called with rule "java/xss"
    And the reach tool bound to the queue item
    And the later request bodies contain "enclosing function doPost"

  Scenario: Agentic run with exec exposes the sandboxed exec tool to the agent
    Given a queue with 1 item rooted at "/repo"
    And a scripted model that calls exec then done
    And an agentic runner with max turns 8 and exec
    When the runner executes the queue
    Then the run yields 1 result
    And the result verdict label is "FP"
    And the exec fake was called with command "python3 -c \"print(42)\""
    And the exec tool bound to the queue item
    And the later request bodies contain "42"
  Scenario: Agentic run with websearch exposes the search tool to the agent
    Given a queue with 1 item rooted at "/repo"
    And a scripted model that calls websearch then done
    And an agentic runner with max turns 8 and websearch
    When the runner executes the queue
    Then the run yields 1 result
    And the result verdict label is "FP"
    And the brave search fake was queried with "spring ParserConfig defaultTyping"
    And the later request bodies contain "Fake Result"
