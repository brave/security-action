Feature: Assignee removed label check
  Detect whether the needs-security-review label was removed by an assignee.

  Scenario: Label removed by an assignee
    Given the PR timeline contains unlabeled events
      | needs-security-review | alice   |
      | some-other-label      | bob     |
    When checking with assignees "alice bob"
    Then the security review was removed by an assignee

  Scenario: Label removed by someone else
    Given the PR timeline contains unlabeled events
      | needs-security-review | carol   |
    When checking with assignees "alice bob"
    Then the security review was not removed by an assignee

  Scenario: Different label removed by an assignee
    Given the PR timeline contains unlabeled events
      | some-other-label | alice   |
    When checking with assignees "alice bob"
    Then the security review was not removed by an assignee

  Scenario: Multiple removals including one by an assignee
    Given the PR timeline contains unlabeled events
      | needs-security-review | carol   |
      | needs-security-review | bob     |
    When checking with assignees "alice bob"
    Then the security review was removed by an assignee

  Scenario: Empty timeline
    Given the PR timeline contains unlabeled events
      | bug | carol   |
    When checking with assignees "alice bob"
    Then the security review was not removed by an assignee
