Feature: Codeowners summary comment
  Post or update a GitHub comment summarising code owners for changed files.
  The default minimum file threshold is 50 and the default mode is groups.

  Scenario: Creates a comment when none exists
    Given a PR with 60 changed files owned by "alice"
    When posting the codeowners comment in mode "always"
    Then a new comment is created
    And the comment body contains "Code Owners Summary"
    And the comment body contains "alice"

  Scenario: Updates an existing codeowners comment
    Given a PR with 60 changed files owned by "alice"
    And an existing codeowners comment "99"
    When posting the codeowners comment in mode "always"
    Then the comment "99" is updated
    And no new comment is created

  Scenario: Mode never deletes any existing comment
    Given a PR with 60 changed files owned by "alice"
    And an existing codeowners comment "99"
    When posting the codeowners comment in mode "never"
    Then the codeowners comment "99" is deleted
    And no new comment is created

  Scenario: Few changed files skip the comment
    Given a PR with 3 changed files owned by "alice"
    And an existing codeowners comment "99"
    When posting the codeowners comment in mode "always" with a threshold of 10
    Then the codeowners comment "99" is deleted
    And no new comment is created

  Scenario: Files without owners skip the comment
    Given a PR with 60 changed files without owners
    When posting the codeowners comment in mode "always"
    Then no new comment is created

  Scenario: Groups mode without teams skips the comment
    Given a PR with 60 changed files owned by "alice"
    When posting the codeowners comment
    Then no new comment is created

  Scenario: Teams and individuals are listed
    Given a PR with 60 changed files owned by team "brave/security-team" and individual "alice"
    When posting the codeowners comment
    Then a new comment is created
    And the comment body contains "brave/security-team"
    And the comment body contains "alice"

  Scenario: File lists collapse beyond five files
    Given a PR with 8 changed files owned by "alice"
    When posting the codeowners comment in mode "always" with a threshold of 5
    Then a new comment is created
    And the comment body contains "and 3 more files"
    And the comment body contains a diff anchor for "src/file0.js"

  Scenario: Huge PRs truncate the comment body
    Given a PR with 600 changed files owned by "alice"
    When posting the codeowners comment in mode "always"
    Then a new comment is created
    And the comment body is under 65536 characters
    And the comment body contains "truncated"
