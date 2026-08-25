Feature: Dependabot nudge
  The nudge tool scans org repositories for open Dependabot alerts,
  builds per-repo messages for the Slack threads and optionally
  assigns the repo maintainers to each alert.

  Background:
    Given the org "brave"

  Scenario: Repositories without alerts produce no messages
    Given the repository "brave/foo"
    When running the dependabot nudge
    Then the result is an empty message list

  Scenario: A repository with alerts produces one message
    Given the repository "brave/foo"
    And repo "foo" has 2 alerts
    When running the dependabot nudge
    Then the result has 1 message
    And the message for "foo" totals 2 alerts with 0 critical
    And the message for "foo" contains "pkg-1"
    And the message for "foo" contains "Handle this alert at"
    And the message for "foo" has cc line "cc @yan - *No maintainers listed for the given vulnerabilities, consider migrating and archiving this repository*"

  Scenario: Critical alerts are counted
    Given the repository "brave/foo"
    And repo "foo" has an alert with severity "critical"
    And repo "foo" has an alert with severity "high"
    When running the dependabot nudge
    Then the message for "foo" totals 2 alerts with 1 critical

  Scenario: Archived and disabled repositories are skipped
    Given the repository "brave/foo"
    And the archived repository "brave/bar"
    And the disabled repository "brave/baz"
    And repo "bar" has 1 alert
    And repo "baz" has 1 alert
    When running the dependabot nudge
    Then the result is an empty message list

  Scenario: Skipped repositories are not scanned
    Given the repository "brave/chromium"
    And repo "chromium" has 2 alerts
    And the skipped repositories "chromium"
    When running the dependabot nudge
    Then the result is an empty message list

  Scenario: Alerts matching a skip hotword are excluded
    Given the repository "brave/foo"
    And repo "foo" has an alert with summary "Denial of service in lodash"
    And repo "foo" has an alert with summary "RCE in express"
    When running the dependabot nudge
    Then the result has 1 message
    And the message for "foo" totals 1 alerts with 0 critical

  Scenario: Alerts without a patched version are excluded
    Given the repository "brave/foo"
    And repo "foo" has an alert without a patched version
    When running the dependabot nudge
    Then the result is an empty message list

  Scenario: Maintainers from repo properties form the cc line
    Given the repository "brave/foo"
    And repo "foo" has 1 alert
    And repo "foo" has maintainers "alice,bob"
    And the GitHub-to-Slack user map
      | alice | <@U1> |
    When running the dependabot nudge
    Then the message for "foo" has cc line "cc <@U1> @bob"

  Scenario: Elected maintainers replace the originals
    Given the repository "brave/foo"
    And repo "foo" has 1 alert
    And repo "foo" has maintainers "alice"
    And repo "foo" has the security-action config
      """
      {"elected_maintainers": "alice:carol"}
      """
    When running the dependabot nudge
    Then the message for "foo" has cc line "cc @carol"

  Scenario: Maintainers are assigned to each alert
    Given the repository "brave/foo"
    And repo "foo" has 2 alerts
    And repo "foo" has maintainers "alice,bob"
    When running the dependabot nudge
    Then each alert is assigned to "alice,bob"

  Scenario: Assignment can be disabled
    Given the repository "brave/foo"
    And repo "foo" has 2 alerts
    And repo "foo" has maintainers "alice"
    And assigning maintainers is disabled
    When running the dependabot nudge
    Then no alert assignment is requested

  Scenario: An assignment failure still produces the message
    Given the repository "brave/foo"
    And repo "foo" has 1 alert
    And repo "foo" has maintainers "alice"
    And alert assignment fails
    When running the dependabot nudge
    Then the result has 1 message

  Scenario: The single output message mode flattens the result
    Given the repository "brave/foo"
    And repo "foo" has 1 alert
    And repo "foo" has maintainers "alice"
    And the single output message mode
    When running the dependabot nudge
    Then the result is a single message string
    And the single message contains "[brave/foo](https://github.com/brave/foo) has `1` open Dependabot issues"
    And the single message contains "pkg-1"
    And the single message contains "cc @alice"

  Scenario: A repository whose alerts fail to load is skipped
    Given the repository "brave/foo"
    And the repository "brave/bar"
    And repo "foo" has 1 alert
    And repo "bar" fails to list alerts
    When running the dependabot nudge
    Then the result has 1 message
    And the message for "foo" totals 1 alerts with 0 critical

  Scenario: The parent summary without criticals
    When building the parent text for repo "brave/foo" with 4 total and 0 critical
    Then the parent text is "[brave/foo](https://github.com/brave/foo) has `4` open Dependabot issues"

  Scenario: The parent summary with criticals
    When building the parent text for repo "brave/foo" with 4 total and 2 critical
    Then the parent text is "[brave/foo](https://github.com/brave/foo) has `4` open Dependabot issues (**2 critical**)"

  Scenario: The repo message lists findings only
    When building the repo message for 2 alerts
    Then the repo message totals 2 alerts with 1 critical
    And the repo message contains "pkg-1"
    And the repo message contains "Handle this alert at"
    And the repo message does not contain "open Dependabot"
    And the repo message does not contain "cc "

  Scenario: The repo message reads severity from the advisory
    When building the repo message for an alert with a missing top-level severity
    Then the repo message totals 1 alerts with 1 critical

  Scenario: The cc line tags maintainers
    When building the cc line for maintainers
      | <@U1> |
      | <@U2> |
    Then the cc line is "cc <@U1> <@U2>"

  Scenario: The cc line falls back to the default contact
    When building the cc line with no maintainers and default contact
      | yan |
    Then the cc line starts with "cc @yan"

  Scenario: The parent blocks carry the cc inline
    When building the parent blocks for repo "brave/foo" with 3 total and 1 critical and cc "cc <@U1>"
    Then the parent blocks have 1 section
    And the parent blocks section contains "open Dependabot issues"
    And the parent blocks section contains "(*1 critical*)"
    And the parent blocks section ends with " (cc <@U1>)"
    And the parent blocks do not contain "pkg-"

  Scenario: The cc line round-trips through the parent blocks
    When building the parent blocks for repo "brave/foo" with 3 total and 1 critical and cc "cc <@U1> <@U2>"
    Then the parent cc line is "cc <@U1> <@U2>"

  Scenario: The parent cc line reads legacy standalone sections
    When reading the parent cc line from blocks
      | [brave/foo](https://github.com/brave/foo) has `2` open Dependabot issues |
      | cc <@U1> |
    Then the parent cc line is "cc <@U1>"

  Scenario: The parent cc line is empty without a cc
    When reading the parent cc line from blocks
      | no cc anywhere |
    Then the parent cc line is ""
