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

  Scenario: High-confidence injection false positive is suppressed
    Given a triage filter workspace with an enabled config
    And a reviewdog log line for "app/render.js" line 42 with cwe "79" and rule "javascript/xss/render"
    And the mock model answers verdict "FP" confidence "high" reason "constant folded safe"
    When the triage filter runs for runner "opengrep"
    Then the filter exit code is 0
    And the filtered log does not contain "app/render.js:42"
    And the filter summary reports 1 suppressed

  Scenario: Other findings carry a triage note
    Given a triage filter workspace with an enabled config
    And a reviewdog log line for "app/db.js" line 7 with cwe "89" and rule "javascript/sqli/query"
    And the mock model answers verdict "TP" confidence "high" reason "user input reaches sink"
    When the triage filter runs for runner "opengrep"
    Then the filter exit code is 0
    And the filtered log contains "app/db.js:7"
    And the filtered log contains "🤖 triage"

  Scenario: Finding without cwe metadata is triaged and suppressible like allowlisted rules
    Given a triage filter workspace with an enabled config
    And a reviewdog log line without metadata for "app/render.js" line 42
    And the mock model answers verdict "FP" confidence "high" reason "output is escaped"
    When the triage filter runs for runner "npm-audit"
    Then the filter exit code is 0
    And the filtered log does not contain "app/render.js:42"
    And the filter summary reports 1 suppressed

  Scenario: Non-finding lines are never triaged
    Given a triage filter workspace with an enabled config
    And a reviewdog log with a finding line and a non-finding line
    And the mock model answers verdict "FP" confidence "high" reason "constant folded safe"
    When the triage filter runs for runner "opengrep"
    Then the filter exit code is 0
    And the filter summary reports 1 triaged
    And the filtered log contains "reviewdog: 1 findings found"
    And the filtered log does not contain "app/render.js:42"
