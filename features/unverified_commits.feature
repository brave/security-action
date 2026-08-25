Feature: Unverified commits notice
  Comment on PRs with unverified commits and clean up stale notices.

  Scenario: Unverified commit posts a new notice
    Given a commit "aaa111" with verification reason "unsigned"
    When checking unverified commits
    Then the result is "UNVERIFIED-CHANGED"
    And a notice comment is posted listing "aaa111 (unsigned)"

  Scenario: Mixed commits only list unverified ones
    Given a commit "bbb222" verified
    And a commit "ccc333" with verification reason "expired_key"
    When checking unverified commits
    Then the result is "UNVERIFIED-CHANGED"
    And a notice comment is posted listing "ccc333 (expired_key)"

  Scenario: Unchanged notice is kept
    Given a commit "aaa111" with verification reason "unsigned"
    And an existing notice comment "n-1" listing "aaa111 (unsigned)"
    When checking unverified commits
    Then the result is "UNVERIFIED"
    And no notice comment is posted

  Scenario: Changed notice replaces the stale one
    Given a commit "aaa111" with verification reason "unsigned"
    And an existing notice comment "n-1" listing "ddd444 (unknown)"
    When checking unverified commits
    Then the result is "UNVERIFIED-CHANGED"
    And a notice comment is posted listing "aaa111 (unsigned)"
    And the notice comment "n-1" is deleted

  Scenario: All commits verified removes notices
    Given a commit "bbb222" verified
    And an existing notice comment "n-1" listing "ddd444 (unknown)"
    When checking unverified commits
    Then the result is undefined
    And the notice comment "n-1" is deleted

  Scenario: Notices from other authors are untouched
    Given a commit "bbb222" verified
    And an existing notice comment "n-1" by "octocat" listing "ddd444 (unknown)"
    When checking unverified commits
    Then the result is undefined
    And no notice comment is deleted
