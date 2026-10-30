Feature: Verdict parsing and validation
  As the agentic FP triage harness
  I want to validate the model's final JSON verdict
  So that only well-formed verdicts reach the policy gate

  Scenario: Accept a valid FP verdict
    Given the verdict payload:
      """
      {"label": "FP", "confidence": "high", "confidence_score": 0.9, "reason": "value is HTML-escaped before output", "evidence": [{"file": "src/App.java", "lines": "L100-L108", "note": "escape call"}], "agent": "swe-agent", "case_id": "BenchmarkTest00009"}
      """
    When the verdict is parsed
    Then the verdict is valid
    And the verdict label is "FP"
    And the verdict confidence is "high"
    And the verdict confidence score is 0.9
    And the verdict has 1 evidence item

  Scenario: Accept an UNKNOWN verdict without evidence
    Given the verdict payload:
      """
      {"label": "UNKNOWN", "confidence": "low", "confidence_score": 0.2, "reason": "file not found"}
      """
    When the verdict is parsed with case_id "BenchmarkTest00009" and agent "triage-agent"
    Then the verdict is valid
    And the verdict label is "UNKNOWN"
    And the verdict case_id is "BenchmarkTest00009"
    And the verdict agent is "triage-agent"

  Scenario: Reject an invalid label
    Given the verdict payload:
      """
      {"label": "MAYBE", "confidence": "high", "confidence_score": 0.9, "reason": "x", "evidence": []}
      """
    When the verdict is parsed
    Then the verdict is invalid with reason "label"

  Scenario: Reject an invalid confidence
    Given the verdict payload:
      """
      {"label": "TP", "confidence": "certain", "confidence_score": 0.9, "reason": "x", "evidence": []}
      """
    When the verdict is parsed
    Then the verdict is invalid with reason "confidence"

  Scenario: Reject an out-of-range confidence score
    Given the verdict payload:
      """
      {"label": "FP", "confidence": "high", "confidence_score": 1.5, "reason": "x", "evidence": []}
      """
    When the verdict is parsed
    Then the verdict is invalid with reason "confidence_score"

  Scenario: Reject a missing reason
    Given the verdict payload:
      """
      {"label": "FP", "confidence": "high", "confidence_score": 0.9, "evidence": []}
      """
    When the verdict is parsed
    Then the verdict is invalid with reason "reason"

  Scenario: Reject non-array evidence
    Given the verdict payload:
      """
      {"label": "FP", "confidence": "high", "confidence_score": 0.9, "reason": "x", "evidence": "nope"}
      """
    When the verdict is parsed
    Then the verdict is invalid with reason "evidence"

  Scenario: Reject non-JSON payload
    Given the verdict payload:
      """
      I think this is a false positive because it looks safe
      """
    When the verdict is parsed
    Then the verdict is invalid with reason "json"

  Scenario: Strip markdown fences before parsing
    Given the verdict payload:
      """
      ```json
      {"label": "FP", "confidence": "medium", "confidence_score": 0.7, "reason": "escaped", "evidence": [{"file": "src/App.java", "lines": "L100-L108", "note": "escaped before output"}]}
      ```
      """
    When the verdict is parsed
    Then the verdict is valid
    And the verdict label is "FP"

  Scenario: Accept numeric evidence lines array
    Given the verdict payload:
      """
      {"label": "TP", "confidence": "medium", "confidence_score": 0.6, "reason": "sink reached", "evidence": [{"file": "a.java", "lines": [45, 47], "note": "flow"}]}
      """
    When the verdict is parsed
    Then the verdict is valid
    And the verdict has 1 evidence item
