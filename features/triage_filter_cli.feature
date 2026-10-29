Feature: Triage filter CLI
  As the security action maintainer
  I want a fail-open command that applies triage verdicts to a reviewdog log
  So reviewdog never posts suppressed findings and the pipeline never breaks

  Scenario: Disabled config passes the log through untouched
    Given a triage filter workspace with a disabled config
    And a reviewdog log for runner "opengrep"
    When the triage filter runs for runner "opengrep"
    Then the filter exit code is 0
    And the filtered log equals the input log
    And the filter summary reports 0 triaged

  Scenario: Missing raw findings pass the log through untouched
    Given a triage filter workspace with an enabled config
    And a reviewdog log for runner "opengrep"
    When the triage filter runs for runner "opengrep"
    Then the filter exit code is 0
    And the filtered log equals the input log
    And the filter summary reports 0 triaged

  Scenario: High-confidence injection false positive is suppressed
    Given a triage filter workspace with an enabled config
    And a reviewdog log for runner "opengrep"
    And raw findings matching the log line for "app/render.js" line 42
    And the mock model answers verdict "FP" confidence "high" reason "constant folded safe"
    When the triage filter runs for runner "opengrep"
    Then the filter exit code is 0
    And the filtered log does not contain "app/render.js:42"
    And the filter summary reports 1 suppressed

  Scenario: Other findings carry a triage note
    Given a triage filter workspace with an enabled config
    And a reviewdog log for runner "opengrep"
    And raw findings matching the log line for "app/db.js" line 7
    And the mock model answers verdict "TP" confidence "high" reason "user input reaches sink"
    When the triage filter runs for runner "opengrep"
    Then the filter exit code is 0
    And the filtered log contains "app/db.js:7"
    And the filtered log contains "🤖 triage"
    And the filter summary reports 1 triaged
