Feature: Triage findings adapter
  As the security action maintainer
  I want reviewdog log lines converted into triage queue items
  So the agentic harness can triage production findings from the same log that reviewdog posts from

  Background:
    Given an enriched reviewdog log with 2 findings

  Scenario: Findings become unlabeled queue items
    When the log lines are converted to a triage queue
    Then the findings queue has 2 items
    And every item has no ground truth label
    And every item has a repo root of "/repo"

  Scenario: Case id encodes rule path and line
    When the log lines are converted to a triage queue
    Then item 1 has case id "javascript/xss/render:app/render.js:42"

  Scenario: Case json carries the finding for the task formatter
    When the log lines are converted to a triage queue
    Then item 1 raw output has 1 result
    And item 1 file is "app/render.js"
    And item 1 line is 42

  Scenario: Cwe number is extracted from the line comment
    When the log lines are converted to a triage queue
    Then item 1 cwe is "79"
    And item 2 cwe is "89"

  Scenario: Lines without a metadata comment fall back to the runner name
    Given an enriched reviewdog log with a line without metadata
    When the log lines are converted to a triage queue
    Then the findings queue has 1 items
    And item 1 cwe is "null"
    And item 1 has case id "npm-audit:package-lock.json:5"

  Scenario: Non-finding lines are skipped
    Given an enriched reviewdog log with a non-finding line
    When the log lines are converted to a triage queue
    Then the findings queue has 1 items
    And the skipped count is 1

  Scenario: Empty log yields an empty queue
    Given an empty reviewdog log
    When the log lines are converted to a triage queue
    Then the findings queue has 0 items

  Scenario: The finding message excludes log markup
    When the log lines are converted to a triage queue
    Then item 1 message is "Unescaped value rendered into HTML"

  Scenario: Policy suppresses only high-confidence injection false positives
    Given a verdict of label "FP" confidence "high" for cwe "89"
    Then the policy decision is "suppress"
    And a verdict of label "FP" confidence "medium" for cwe "89" has decision "annotate"
    And a verdict of label "FP" confidence "high" for cwe "502" has decision "annotate"
    And a verdict of label "TP" confidence "high" for cwe "89" has decision "keep"
    And a verdict of label "UNKNOWN" confidence "low" for cwe "89" has decision "annotate"

  Scenario: Findings without cwe metadata are suppressible like allowlisted rules
    Given a verdict of label "FP" confidence "high" for cwe "null"
    Then the policy decision is "suppress"
    And a verdict of label "FP" confidence "medium" for cwe "null" has decision "annotate"
    And a verdict of label "TP" confidence "high" for cwe "null" has decision "keep"

  Scenario: Policy allowlist is configurable
    Given a policy allowlist of "22,78"
    Then a verdict of label "FP" confidence "high" for cwe "22" has decision "suppress"
    And a verdict of label "FP" confidence "high" for cwe "79" has decision "annotate"

  Scenario: Policy suppress requires evidence
    Given a verdict of label "FP" confidence "high" with empty evidence for cwe "78"
    Then the policy decision is "annotate"
