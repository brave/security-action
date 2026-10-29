Feature: Triage capture wiring
  As the security action maintainer
  I want the scan runners to capture slim finding records instead of the full scanner JSON
  So the post-scan triage stage gets the fields it needs without re-reading raw output

  Scenario: The opengrep runner captures slim finding records
    When the reviewdog configuration is loaded
    Then the opengrep cmd tees slim findings to "security-action/opengrep-slim.jsonl"
    And the opengrep slim template carries "check_id"
    And the opengrep slim template carries "cwe"
    And the opengrep cmd rebuilds the line format from the slim records
    And the opengrep cmd ensures the capture directory exists

  Scenario: The sveltegrep runner captures slim finding records
    When the reviewdog configuration is loaded
    Then the sveltegrep cmd tees slim findings to "security-action/sveltegrep-slim.jsonl"
    And the sveltegrep cmd rebuilds the line format from the slim records
    And the sveltegrep cmd ensures the capture directory exists

  Scenario: The capture path is overridable
    When the reviewdog configuration is loaded
    Then both runner cmds derive the capture path from RUNNER_TEMP with a tmp fallback

  Scenario: The PR posting path applies the triage filter before posting
    Then the reviewdog script calls the triage filter for "opengrep" before post-findings
    And the reviewdog script calls the triage filter for "sveltegrep" before post-findings
    And the triage filter call is fail-open

  Scenario: The triage filter wrapper is executable
    Then the triage filter wrapper has the executable bit set
