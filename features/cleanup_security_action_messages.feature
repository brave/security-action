Feature: Cleaning up security-action Slack messages
  Stale security-action messages are deleted on review signals:
  checkmark or thumbsup reactions from /cc'd people, label removal by
  an assignee, resolved review threads; a /cc'd reply only strikes
  the message through.

  Scenario: Parsing /cc mentions from message text
    Given the message text "Findings:\n/cc <@U123> <@U456> please review"
    Then the cc user ids are "U123,U456"

  Scenario: /cc parsing ignores mentions before the marker
    Given the message text "<@U000> earlier /cc <@U123>"
    Then the cc user ids are "U123"

  Scenario: Text without a /cc marker yields no users
    Given the message text "no mentions here"
    Then the cc user ids are ""

  Scenario: Empty text yields no users
    Given the message text ""
    Then the cc user ids are ""

  Scenario: PR URL extraction reads text, blocks and attachments
    Given a Slack message whose text, blocks and attachments mention "pull-request: https://github.com/org/repo/pull/42"
    Then the extracted PR url is "https://github.com/org/repo/pull/42"

  Scenario: PR URL extraction returns nothing without a link
    Given a Slack message with no PR link
    Then no PR url is extracted

  Scenario: PR URL parsing splits owner, repo and number
    Given the PR url "https://github.com/org/repo/pull/42"
    Then the parsed PR owner is "org", repo is "repo" and number is 42

  Scenario: Non-PR GitHub urls do not parse
    Given the PR url "https://github.com/org/repo/issues/42"
    Then no PR is parsed

  Scenario: Assignees are recovered from Cc review threads
    Given review threads with a github-actions Cc comment mentioning "@alice @bob"
    Then the extracted assignees are "alice,bob"

  Scenario: Assignee extraction falls back to the defaults
    Given review threads with no github-actions comments
    And the default assignees "sec-team"
    Then the extracted assignees are "sec-team"

  Scenario: All resolved by assignees satisfies signal D
    Given review threads with a github-actions Cc comment mentioning "@alice" resolved by "alice"
    And the assignees "alice"
    Then all security threads are resolved

  Scenario: An unresolved security thread fails signal D
    Given review threads with a github-actions Cc comment mentioning "@alice" left unresolved
    And the assignees "alice"
    Then not all security threads are resolved

  Scenario: Resolution by an outsider fails signal D
    Given review threads with a github-actions Cc comment mentioning "@alice" resolved by "mallory"
    And the assignees "alice"
    Then not all security threads are resolved

  Scenario: No security threads at all satisfies signal D
    Given review threads with only human comments
    And the assignees "sec-team"
    Then all security threads are resolved

  Scenario: Strikethrough wraps every non-empty line
    Given the message text "line one\n\nline two"
    Then the strikethrough text is "~line one~\n\n~line two~"

  Scenario: Empty text strikes through as empty
    Given the message text ""
    Then the strikethrough text is "~(empty)~"

  Scenario: Signal A: checkmark from a cc'd person deletes the message
    Given a cleanup channel with a security-action message with a checkmark from cc'd user "U123"
    And a GitHub client with the linked PR state
    When cleanup runs
    Then one message is deleted
    And no message is struck through

  Scenario: Signal B: thumbsup from a cc'd person deletes the message
    Given a cleanup channel with a security-action message with a thumbsup from cc'd user "U123"
    And a GitHub client with the linked PR state
    When cleanup runs
    Then one message is deleted

  Scenario: Signal C: label removal by an assignee deletes the message
    Given a cleanup channel with a security-action message with no reactions
    And a GitHub client where the needs-security-review label was removed by "alice"
    And the linked PR has review threads with a github-actions Cc comment mentioning "@alice"
    When cleanup runs with default assignees "alice"
    Then one message is deleted

  Scenario: Signal D: all threads resolved by an assignee deletes the message
    Given a cleanup channel with a security-action message with no reactions
    And a GitHub client where the label is still present
    And the linked PR has review threads with a github-actions Cc comment mentioning "@alice" resolved by "alice"
    When cleanup runs with default assignees "alice"
    Then one message is deleted

  Scenario: Signal E: a cc'd reply strikes the message through
    Given a cleanup channel with a security-action message with no reactions
    And a GitHub client where the label is still present
    And the linked PR has an unresolved github-actions Cc comment mentioning "@alice"
    And the Slack thread of that message has a reply from cc'd user "U123"
    When cleanup runs with default assignees "alice"
    Then no message is deleted
    And one message is struck through

  Scenario: No signals leaves the message untouched
    Given a cleanup channel with a security-action message with no reactions
    And a GitHub client where the label is still present
    And the linked PR has an unresolved github-actions Cc comment mentioning "@alice"
    When cleanup runs with default assignees "alice"
    Then no message is deleted
    And no message is struck through

  Scenario: Non security-action messages are ignored
    Given a cleanup channel with only messages from other users
    And a GitHub client with the linked PR state
    When cleanup runs
    Then no message is deleted

  Scenario: A message without a PR url skips the GitHub signals
    Given a cleanup channel with a security-action message with no PR link and no reactions
    And a GitHub client with the linked PR state
    When cleanup runs
    Then no message is deleted
    And no github query happened

  Scenario: GitHub errors fall through to signal E
    Given a cleanup channel with a security-action message with no reactions
    And a GitHub client that fails every query
    And the Slack thread of that message has a reply from cc'd user "U123"
    When cleanup runs
    Then one message is struck through

  Scenario: Missing token is rejected
    When cleanup runs without a token
    Then cleanup fails with "token is required!"

  Scenario: Missing github client is rejected
    When cleanup runs without a github client
    Then cleanup fails with "github is required!"

  Scenario: Debug mode counts without deleting
    Given a cleanup channel with a security-action message with a checkmark from cc'd user "U123"
    And a GitHub client with the linked PR state
    When cleanup runs in debug mode
    Then no message is deleted
    And the cleanup reports one affected message
