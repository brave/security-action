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
    And a scripted model that answers a plain-content verdict
    And a vanilla runner
    When the runner executes the queue
    Then the run yields 1 result
    And exactly 1 model request made
    And the result verdict label is "FP"

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

  Scenario: Results are appended to a JSONL artifact
    Given a queue with 2 items
    And a scripted model that calls done immediately
    When the runner executes the queue
    Then the JSONL artifact has 2 lines in queue order