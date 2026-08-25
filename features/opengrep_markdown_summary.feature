Feature: Opengrep markdown summary
  Render scan findings as a markdown report with optional delta context.

  Scenario: No findings
    When generating the markdown summary
    Then the summary contains "No Opengrep findings detected."

  Scenario: Findings without comparison context
    Given findings for rule "a.rule" on files "src/x.js" at lines 1 and 2
    And the rule statistics count 2 findings for "a.rule" with severity "ERROR"
    When generating the markdown summary
    Then the summary contains "Found **2** findings across **1** rules."

  Scenario: Comparison with no new findings
    Given findings for rule "a.rule" on files "src/x.js" at lines 1 and 2
    And the rule statistics count 2 findings for "a.rule" with severity "ERROR"
    And an empty delta against 2 base findings
    When generating the markdown summary
    Then the summary contains "No new findings introduced by rule changes."

  Scenario: Comparison with new findings and rules
    Given findings for rule "a.rule" on files "src/x.js" at line 1
    And findings for rule "b.rule" on files "src/y.js" at line 2
    And the rule statistics count 1 finding for "a.rule" with severity "ERROR"
    And the rule statistics count 1 new finding for "b.rule" with severity "ERROR"
    And a delta introducing rule "b.rule" with 1 new finding
    When generating the markdown summary
    Then the summary contains "New findings from rule changes: **1**"
    And the summary contains "New rules introduced: **1**"

  Scenario: New rules are marked in the summary table
    Given findings for rule "b.rule" on files "src/y.js" at line 2
    And the rule statistics count 1 new finding for "b.rule" with severity "ERROR"
    And a delta introducing rule "b.rule" with 1 new finding
    When generating the markdown summary
    Then the summary contains "🆕 New"

  Scenario: More than three findings per file are collapsed
    Given findings for rule "a.rule" on file "src/x.js" at lines 1, 2, 3 and 4
    And the rule statistics count 4 findings for "a.rule" with severity "ERROR"
    When generating the markdown summary
    Then the summary contains "... and 1 more"

  Scenario: More than ten files per rule are collapsed
    Given findings for rule "a.rule" on 12 files
    And the rule statistics count 12 findings for "a.rule" with severity "ERROR"
    When generating the markdown summary
    Then the summary contains "... and 2 more files"

  Scenario: Findings link to the target repo
    Given findings for rule "a.rule" on files "src/x.js" at line 1
    And the rule statistics count 1 finding for "a.rule" with severity "ERROR"
    When generating the markdown summary for repo "brave/brave-browser" on branch "main"
    Then the summary contains "https://github.com/brave/brave-browser/blob/main/src/x.js#L1"

  Scenario: Findings without a target repo show plain lines
    Given findings for rule "a.rule" on files "src/x.js" at line 1
    And the rule statistics count 1 finding for "a.rule" with severity "ERROR"
    When generating the markdown summary
    Then the summary contains "- Line 1"
