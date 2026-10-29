Feature: Triage capture wiring
  As the security action maintainer
  I want the scan runners to tee their raw JSON before the jq stage discards it
  So the post-scan triage stage can re-analyze full findings

  Scenario: The opengrep runner tees raw JSON to a stable path
    When the reviewdog configuration is loaded
    Then the opengrep cmd tees raw json to "security-action/opengrep-raw.json"
    And the opengrep cmd ensures the capture directory exists

  Scenario: The sveltegrep runner tees raw JSON to a stable path
    When the reviewdog configuration is loaded
    Then the sveltegrep cmd tees raw json to "security-action/sveltegrep-raw.json"
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
