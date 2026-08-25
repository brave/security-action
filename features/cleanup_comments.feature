Feature: Cleanup outdated Cc comments
  Delete outdated single github-actions Cc review comments.

  Scenario: Outdated single Cc comment is deleted
    Given an outdated review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- id-1 -->\n"
    When cleaning up comments
    Then the comment "c-1" is deleted

  Scenario: Current Cc comment is kept
    Given a current review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- id-1 -->\n"
    When cleaning up comments
    Then no comment is deleted

  Scenario: Multi-comment thread is kept
    Given an outdated review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- id-1 -->\n" with 2 comments
    When cleaning up comments
    Then no comment is deleted

  Scenario: Comment from another author is kept
    Given an outdated review thread comment "c-1" by "octocat" with body "found<br>Cc @alice\n<!-- id-1 -->\n"
    When cleaning up comments
    Then no comment is deleted

  Scenario: Comment without Cc marker is kept
    Given an outdated review thread comment "c-1" by "github-actions" with body "normal comment"
    When cleaning up comments
    Then no comment is deleted

  Scenario: Multiple outdated comments are all deleted
    Given an outdated review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- id-1 -->\n"
    And an outdated review thread comment "c-2" by "github-actions" with body "found<br>Cc @bob\n<!-- id-2 -->\n"
    When cleaning up comments
    Then the comment "c-1" is deleted
    And the comment "c-2" is deleted
