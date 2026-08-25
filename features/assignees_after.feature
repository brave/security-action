Feature: Assignees after Cc comments
  Collect assignees from github-actions Cc review comments, falling back to
  the provided assignee list when no Cc comments exist.

  Scenario: Cc mentions become assignees
    Given a review thread comment by "github-actions" with body "found something<br>Cc @alice @bob\n<!-- id-1 -->\n"
    When resolving assignees after review with fallback "carol dave"
    Then the assignees are "alice\nbob"

  Scenario: Multiple Cc threads are merged and deduplicated
    Given a review thread comment by "github-actions" with body "found something<br>Cc @alice @bob\n<!-- id-1 -->\n"
    And a review thread comment by "github-actions" with body "another one<br>Cc @bob @dave\n<!-- id-2 -->\n"
    When resolving assignees after review with fallback "carol dave"
    Then the assignees are "alice\nbob\ndave"

  Scenario: Comments from other authors are ignored
    Given a review thread comment by "octocat" with body "found something<br>Cc @alice @bob\n<!-- id-1 -->\n"
    When resolving assignees after review with fallback "carol dave"
    Then the assignees are "carol\ndave"

  Scenario: Comments without Cc marker are ignored
    Given a review thread comment by "github-actions" with body "just a normal review comment"
    When resolving assignees after review with fallback "carol dave"
    Then the assignees are "carol\ndave"

  Scenario: Empty threads fall back to provided assignees
    When resolving assignees after review with fallback "carol dave"
    Then the assignees are "carol\ndave"

  Scenario: PR number passed as a string is accepted
    Given a review thread comment by "github-actions" with body "found something<br>Cc @alice\n<!-- id-1 -->\n"
    When resolving assignees for PR "42" with fallback "carol"
    Then the assignees are "alice"
