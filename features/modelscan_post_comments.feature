Feature: modelscan review comments
  The modelscan step runs the Python audit script and posts file-level
  review comments for binary findings, bypassing reviewdog which cannot
  comment on binary files.

  Background:
    Given the repository "test-org/test-repo" with pull request 42

  Scenario: No findings
    Given a modelscan run with no output
    When posting modelscan comments
    Then no GitHub API call is made

  Scenario: A finding posts a file-level review comment
    Given a modelscan run that outputs
      """json
      {"path": "model.pkl", "severity": "CRITICAL", "description": "eval in pickle", "module": "__builtin__", "operator": "eval", "scanner": "pickle"}
      """
    And the modelscan assignees "thypon"
    When posting modelscan comments
    Then a review comment is posted on "model.pkl"
    And the comment is anchored to the pull request head
    And the modelscan comment body contains "**modelscan: CRITICAL** — eval in pickle"
    And the modelscan comment body contains "`__builtin__.eval`"
    And the modelscan comment body contains "Source: https://github.com/brave/security-action"
    And the modelscan comment body contains "<br>Cc @thypon"
    And the modelscan comment body contains "<!-- Category: security -->"
    And the modelscan comment body contains "<!-- modelscan -->"

  Scenario: A finding without an operator shows the module only
    Given a modelscan run that outputs
      """json
      {"path": "model.pkl", "severity": "HIGH", "description": "dangerous module", "module": "os", "scanner": "pickle"}
      """
    When posting modelscan comments
    Then a review comment is posted on "model.pkl"
    And the modelscan comment body contains "`os`"

  Scenario: No assignees means no Cc line
    Given a modelscan run that outputs
      """json
      {"path": "model.pkl", "severity": "HIGH", "description": "dangerous module", "module": "os", "scanner": "pickle"}
      """
    When posting modelscan comments
    Then a review comment is posted on "model.pkl"
    And the modelscan comment body does not contain "<br>Cc"

  Scenario: Multiple assignees are each mentioned
    Given a modelscan run that outputs
      """json
      {"path": "model.pkl", "severity": "CRITICAL", "description": "eval in pickle", "module": "__builtin__", "operator": "eval", "scanner": "pickle"}
      """
    And the modelscan assignees "alice bob"
    When posting modelscan comments
    Then a review comment is posted on "model.pkl"
    And the modelscan comment body contains "<br>Cc @alice @bob"

  Scenario: Paths with an existing modelscan comment are not reposted
    Given a modelscan run that outputs
      """json
      {"path": "existing.pkl", "severity": "HIGH", "description": "open in pickle", "module": "__builtin__", "operator": "open", "scanner": "pickle"}
      """
    And an existing modelscan comment on "existing.pkl"
    When posting modelscan comments
    Then no review comment is posted

  Scenario: Comments by other authors do not block posting
    Given a modelscan run that outputs
      """json
      {"path": "model.pkl", "severity": "HIGH", "description": "open in pickle", "module": "__builtin__", "operator": "open", "scanner": "pickle"}
      """
    And an existing comment on "model.pkl" by "someone-else"
    When posting modelscan comments
    Then a review comment is posted on "model.pkl"

  Scenario: Outdated single-comment threads allow re-posting
    Given a modelscan run that outputs
      """json
      {"path": "retry.pkl", "severity": "HIGH", "description": "exec in pickle", "module": "__builtin__", "operator": "exec", "scanner": "pickle"}
      """
    And an outdated modelscan comment on "retry.pkl"
    When posting modelscan comments
    Then a review comment is posted on "retry.pkl"

  Scenario: Comments are capped at 10
    Given a modelscan run with 15 findings
    When posting modelscan comments
    Then 10 review comments are posted

  Scenario: Invalid path errors are skipped gracefully
    Given a modelscan run that outputs
      """json
      {"path": "deleted.pkl", "severity": "HIGH", "description": "bad", "module": "os", "operator": "system", "scanner": "pickle"}
      """
    And posting comments fails with status 422 "deleted.pkl is not a valid path"
    When posting modelscan comments
    Then the posting does not fail

  Scenario: A spawn failure posts nothing
    Given a modelscan run that fails to spawn
    When posting modelscan comments
    Then no GitHub API call is made

  Scenario: A non-zero exit still posts partial findings
    Given a modelscan run that exits with status 1 and outputs
      """json
      {"path": "partial.pkl", "severity": "HIGH", "description": "eval", "module": "__builtin__", "operator": "eval", "scanner": "pickle"}
      """
    When posting modelscan comments
    Then a review comment is posted on "partial.pkl"

  Scenario: Garbage output lines are skipped
    Given a modelscan run that outputs
      """
      not json at all
      {"path": "model.pkl", "severity": "HIGH", "description": "kept", "module": "os", "scanner": "pickle"}
      """
    When posting modelscan comments
    Then a review comment is posted on "model.pkl"

  Scenario: The audit runs via uv against the action project
    Given a modelscan run with no output
    When posting modelscan comments
    Then the audit is spawned via uv
    And the audit SCRIPTPATH points at the assets directory
    And the audit runs in the workspace directory
