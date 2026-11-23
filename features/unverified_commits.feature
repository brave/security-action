Feature: Unverified commits notice
  Comment on PRs with unverified commits, add the unverified-commits
  label, and clean up stale notices and labels.

  Scenario: Unverified commit posts a new notice
    Given a commit "aaa111" with verification reason "unsigned"
    When checking unverified commits
    Then the result is "UNVERIFIED-CHANGED"
    And a notice comment is posted listing "aaa111 (unsigned)"
    And the label "unverified-commits" is added

  Scenario: Mixed commits only list unverified ones
    Given a commit "bbb222" verified
    And a commit "ccc333" with verification reason "expired_key"
    When checking unverified commits
    Then the result is "UNVERIFIED-CHANGED"
    And a notice comment is posted listing "ccc333 (expired_key)"
    And the label "unverified-commits" is added

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
    And the label "unverified-commits" is added

  Scenario: All commits verified removes notices and label
    Given a commit "bbb222" verified
    And the issue has label "unverified-commits"
    And an existing notice comment "n-1" listing "ddd444 (unknown)"
    When checking unverified commits
    Then the result is "VERIFIED"
    And the notice comment "n-1" is deleted
    And the label "unverified-commits" is removed

  Scenario: All commits verified without the label writes none
    Given a commit "bbb222" verified
    When checking unverified commits
    Then the result is "VERIFIED"
    And no label writes happen

  Scenario: Unchanged notice leaves the label alone
    Given a commit "aaa111" with verification reason "unsigned"
    And an existing notice comment "n-1" listing "aaa111 (unsigned)"
    And the issue has label "unverified-commits"
    When checking unverified commits
    Then the result is "UNVERIFIED"
    And no label writes happen

  Scenario: Notices from other authors are untouched
    Given a commit "bbb222" verified
    And an existing notice comment "n-1" by "octocat" listing "ddd444 (unknown)"
    When checking unverified commits
    Then the result is "VERIFIED"
    And no notice comment is deleted

  Scenario: Fork PR cannot add the label
    Given a commit "aaa111" with verification reason "unsigned"
    And adding labels fails with "Resource not accessible by integration"
    When checking unverified commits
    Then the result is "UNVERIFIED-CHANGED"
    And a warning is logged containing "add unverified-commits label"

  Scenario: Fork PR cannot remove the label
    Given a commit "bbb222" verified
    And the issue has label "unverified-commits"
    And removing labels fails with "Resource not accessible by integration"
    When checking unverified commits
    Then the result is "VERIFIED"
    And a warning is logged containing "remove unverified-commits label"
