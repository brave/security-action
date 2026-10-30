Feature: Triage capture wiring
  As the security action maintainer
  I want scan findings to carry their CWE and rule id inside the reviewdog line itself
  So the post-scan triage stage reads one log format and no side-channel JSON files exist

  Scenario: The opengrep runner embeds CWE and rule in the line
    When the reviewdog configuration is loaded
    Then the opengrep cmd embeds a category comment with "CWE:"
    And the opengrep cmd embeds a category comment with "Rule:"
    And the opengrep cmd does not tee a slim jsonl side channel

  Scenario: The sveltegrep runner embeds CWE and rule in the line
    When the reviewdog configuration is loaded
    Then the sveltegrep cmd embeds a category comment with "CWE:"
    And the sveltegrep cmd embeds a category comment with "Rule:"
    And the sveltegrep cmd does not tee a slim jsonl side channel

  Scenario: The PR posting path applies the triage filter to every runner
    Then the reviewdog script calls the triage filter for "safesvg" before post-findings
    And the reviewdog script calls the triage filter for "opengrep" before post-findings
    And the reviewdog script calls the triage filter for "sveltegrep" before post-findings
    And the reviewdog script calls the triage filter for "npm-audit" before post-findings
    And the reviewdog script calls the triage filter for "pip-audit" before post-findings
    And the triage filter call is fail-open

  Scenario: The triage filter wrapper is executable
    Then the triage filter wrapper has the executable bit set
