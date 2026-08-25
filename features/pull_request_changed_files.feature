Feature: Listing changed files of a pull request
  Page through the GraphQL files connection of a pull request and
  keep the paths that have additions.

  Background:
    Given a GitHub client for org "test-org" repo "test-repo"

  Scenario: Files with additions are returned
    Given the pull request 7 has file pages
      | a.js    | 3         |
      | b.js    | 0         |
      | c.txt   | 1         |
    When listing the changed files of pull request 7
    Then the changed files are "a.js,c.txt"

  Scenario: File pages are followed until exhausted
    Given the pull request 8 has file pages
      | one.js  | 1         |
      | two.js  | 1         |
    And more file pages for pull request 8
      | three.js| 1         |
    When listing the changed files of pull request 8
    Then the changed files are "one.js,two.js,three.js"
    And the graphql query ran 2 times

  Scenario: A pull request number given as a string is parsed
    Given the pull request 7 has file pages
      | a.js    | 3         |
    When listing the changed files of pull request "7"
    Then the changed files are "a.js"

  Scenario: A github client or token is required
    When listing the changed files without a github client
    Then the action fails with "either githubToken or github is required!"
