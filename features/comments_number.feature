Feature: Cc comments number
  Count active github-actions Cc review comments and their categories.

  Scenario: Active Cc comments are counted
    Given a current review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- Category: security -->\n<!-- id -->\n"
    And a current review thread comment "c-2" by "github-actions" with body "found<br>Cc @bob\n<!-- Category: security -->\n<!-- id -->\n"
    When counting Cc comments
    Then the count is 2
    And the categories are "security"

  Scenario: Categories are collected uniquely
    Given a current review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- Category: security -->\n<!-- id -->\n"
    And a current review thread comment "c-2" by "github-actions" with body "found<br>Cc @bob\n<!-- Category: license -->\n<!-- id -->\n"
    When counting Cc comments
    Then the count is 2
    And the categories are "license,security"

  Scenario: Outdated single comments are excluded
    Given an outdated review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- Category: security -->\n<!-- id -->\n"
    When counting Cc comments
    Then the count is 0
    And the categories are ""

  Scenario: Outdated multi-comment threads are included
    Given an outdated review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- Category: security -->\n<!-- id -->\n" with 2 comments
    When counting Cc comments
    Then the count is 1
    And the categories are "security"

  Scenario: Comments without a category have no categories
    Given a current review thread comment "c-1" by "github-actions" with body "found<br>Cc @alice\n<!-- id -->\n"
    When counting Cc comments
    Then the count is 1
    And the categories are ""

  Scenario: Comments from other authors are excluded
    Given a current review thread comment "c-1" by "octocat" with body "found<br>Cc @alice\n<!-- Category: security -->\n<!-- id -->\n"
    When counting Cc comments
    Then the count is 0
    And the categories are ""
