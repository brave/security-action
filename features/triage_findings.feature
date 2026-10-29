Feature: Triage findings adapter
  As the security action maintainer
  I want slim opengrep findings converted into triage queue items
  So the agentic harness can triage production findings after the scan

  Background:
    Given a slim opengrep capture with 2 findings

  Scenario: Findings become unlabeled queue items
    When the findings are converted to a triage queue
    Then the findings queue has 2 items
    And every item has no ground truth label
    And every item has a repo root of "/repo"

  Scenario: Case id encodes rule path and line
    When the findings are converted to a triage queue
    Then item 1 has case id "javascript/xss/render:app/render.js:42"

  Scenario: Case json carries the opengrep result for the task formatter
    When the findings are converted to a triage queue
    Then item 1 raw output has 1 opengrep result
    And item 1 file is "app/render.js"

  Scenario: Cwe number is extracted from the capture
    When the findings are converted to a triage queue
    Then item 1 cwe is "79"
    And item 2 cwe is "null"

  Scenario: Records with missing path are skipped
    Given a slim opengrep capture with a finding missing its path
    When the findings are converted to a triage queue
    Then the findings queue has 1 items
    And the skipped count is 1

  Scenario: Empty capture yields an empty queue
    Given a slim opengrep capture that is empty
    When the findings are converted to a triage queue
    Then the findings queue has 0 items

  Scenario: Malformed records are skipped
    Given a slim opengrep capture with a malformed record
    When the findings are converted to a triage queue
    Then the findings queue has 1 items
    And the skipped count is 1

  Scenario: Policy suppresses only high-confidence injection false positives
    Given a verdict of label "FP" confidence "high" for cwe "89"
    Then the policy decision is "suppress"
    And a verdict of label "FP" confidence "medium" for cwe "89" has decision "annotate"
    And a verdict of label "FP" confidence "high" for cwe "502" has decision "annotate"
    And a verdict of label "TP" confidence "high" for cwe "89" has decision "keep"
    And a verdict of label "UNKNOWN" confidence "low" for cwe "89" has decision "annotate"

  Scenario: Policy allowlist is configurable
    Given a policy allowlist of "22,78"
    Then a verdict of label "FP" confidence "high" for cwe "22" has decision "suppress"
    And a verdict of label "FP" confidence "high" for cwe "79" has decision "annotate"

  Scenario: Policy suppress requires evidence
    Given a verdict of label "FP" confidence "high" with empty evidence for cwe "78"
    Then the policy decision is "annotate"
