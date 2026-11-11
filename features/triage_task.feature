Feature: Triage task formatting
  As the agentic FP triage harness
  I want a case JSON rendered into a read-only triage task prompt
  So that any model receives the same deterministic task as the paper's runner

  Background:
    Given a repo root "/repo" with file "src/App.java" containing:
      """
      class App { int f() { return 1; } }
      """
    And a triage case with case_id "BenchmarkTest00009"
    And the case file is "src/App.java"
    And the case tools are "Scanner, Sonarqube"
    And the case raw_output has one Scanner finding "java/xss" with message "Cross-site scripting vulnerability due to a user-provided value" at line 102

  Scenario: Render a complete task prompt
    When the task is formatted with agent "swe-agent"
    Then the task contains "# SAST Alert FP Triage (Read-only)"
    And the task contains "case_id**: `BenchmarkTest00009`"
    And the task contains "repo_root (host)**: `/repo`"
    And the task contains the file contents "class App { int f() { return 1; } }"
    And the task contains "java/xss"
    And the task contains "You must triage it into one of"
    And the task contains the rules "READ-ONLY"
    And the task contains the output schema keys "label, confidence, confidence_score, reason, evidence, agent, case_id"

  Scenario: Prompt states conservative TP guidance
    When the task is formatted with agent "swe-agent"
    Then the task contains "Be conservative about `TP`"
    And the task contains "a single JSON object only"

  Scenario: Agent hint is rendered per runtime
    When the task is formatted with agent "swe-agent"
    Then the task contains "You are running under SWE-agent"
    When the task is formatted with agent "generic"
    Then the task contains "You are running in an automated headless environment"

  Scenario: Missing case_id falls back to stable hash id
    Given a triage case with no case_id
    When the task is formatted with agent "generic"
    Then the task case_id starts with "case-"

  Scenario: Missing file content is tolerated
    Given the repo has no file "src/App.java"
    When the task is formatted with agent "generic"
    Then the task contains "<file content unavailable>"

  Scenario: Registry tools are nudged inside the prompt
    Given the repo has file "src/App.java" containing "class App {}"
    When the task is formatted with agent "swe-agent" and a tool registry
    Then the task contains "## Available tools"
    And the task contains "**view**:"
    And the task contains "**grep**:"
    And the task contains "**done**:"
