Feature: Triage log filter
  As the security action maintainer
  I want reviewdog log lines filtered by triage verdicts before posting
  So suppressed false positives never become PR comments and others carry an annotation

  Background:
    Given a triage row for "app/render.js" line 42 with verdict "FP" confidence "high" reason "constant folded safe"
    And a triage row for "app/db.js" line 7 with verdict "TP" confidence "high" reason "user input reaches sink"
    And a reviewdog log with 3 lines

  Scenario: Suppressed findings are dropped from the log
    When the log is filtered by triage verdicts
    Then the filtered log has 2 lines
    And the log line for "app/render.js" line 42 is gone
    And the suppressed count is 1

  Scenario: Annotated findings carry a triage note
    When the log is filtered by triage verdicts
    Then the log line for "app/db.js" line 7 contains "🤖 triage"
    And the log line for "app/db.js" line 7 contains "TP/high"
    And the log line for "app/db.js" line 7 contains "user input reaches sink"
    And the annotated count is 1

  Scenario: Untouched findings pass through unchanged
    When the log is filtered by triage verdicts
    Then the log line for "app/keep.js" line 3 is unchanged

  Scenario: Log lines without a match are kept
    Given a reviewdog log with a malformed line
    When the log is filtered by triage verdicts
    Then the filtered log has 2 lines
    And the log line "this line is not a reviewdog finding at all" is kept

  Scenario: Annotation is truncated to 200 characters
    Given a triage row for "app/long.js" line 9 with verdict "UNKNOWN" confidence "low" reason "r" repeated 100 times
    And a reviewdog log with a line for "app/long.js" line 9
    When the log is filtered by triage verdicts
    Then the log line for "app/long.js" line 9 is at most 300 characters
