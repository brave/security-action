Feature: Sending Slack messages
  Markdown delivery with colored attachments, thread targeting and
  content-hash deduplication within a day.

  Scenario: Missing token is rejected
    When sending a Slack message without a token
    Then sending fails with "token is required!"

  Scenario: Missing channel is rejected
    When sending a Slack message without a channel
    Then sending fails with "channel is required!"

  Scenario: Missing message and text are rejected
    When sending a Slack message without a message or text
    Then sending fails with "message || token is required!"

  Scenario: A named color maps to its hex code
    Given a Slack channel "alerts"
    When sending a Slack message with markdown body and color "red"
    Then the message is posted with attachment color "#F44336"

  Scenario: An already-hex color passes through
    Given a Slack channel "alerts"
    When sending a Slack message with markdown body and color "#123ABC"
    Then the message is posted with attachment color "#123ABC"

  Scenario: An invalid color renders as plain blocks
    Given a Slack channel "alerts"
    When sending a Slack message with markdown body and color "sparkles"
    Then the message is posted without attachments

  Scenario: Plain text is sent as a single section block
    Given a Slack channel "alerts"
    When sending a Slack message with text "hello world"
    Then the message is posted with text "hello world"

  Scenario: An identical message within a day is debounced
    Given a Slack channel "alerts" which already received the same message today
    When sending a Slack message with text "hello world"
    Then no new message is posted

  Scenario: Debounce throws in debug mode
    Given a Slack channel "alerts" which already received the same message today
    When sending a Slack message with text "hello world" in debug mode
    Then sending fails with "debounce message"

  Scenario: A different message is not debounced
    Given a Slack channel "alerts" which already received the same message today
    When sending a Slack message with text "different content"
    Then the message is posted with text "different content"

  Scenario: Findings counts are normalized before hashing
    Given a Slack channel "alerts" which already received a message with a findings count
    When sending a Slack message with text "hello world" and a message body with another findings count
    Then no new message is posted

  Scenario: The posted body keeps the real findings count
    Given a Slack channel "alerts"
    When sending a Slack message with text "hello world" and a message body with another findings count
    Then the message is posted with body "Findings: 99"
    And the posted body does not contain "n+"

  Scenario: Posting into a thread scans thread replies for dedup
    Given a Slack channel "alerts" with thread "1111.2222" already containing the same message
    When sending a Slack message with text "hello world" into thread "1111.2222"
    Then no new message is posted

  Scenario: Thread replies carry the thread timestamp
    Given a Slack channel "alerts"
    When sending a Slack message with text "hello world" into thread "1111.2222"
    Then the message is posted into thread "1111.2222"

  Scenario: An explicit channel id skips channel resolution
    Given a Slack channel "alerts"
    When sending a Slack message with text "hello world" to channel id "C999"
    Then the message is posted to channel "C999"
    And no channel listing happened

  Scenario: Event metadata travels with the message
    Given a Slack channel "alerts"
    When sending a Slack message with text "hello world" and event type "alerts"
    Then the message is posted with metadata event type "alerts"

  Scenario: Long markdown is capped at fifty blocks
    When converting a markdown message of sixty paragraphs to blocks
    Then at most fifty blocks are produced
    And the last original block survives the cap
    And the cap is announced with "...and more"

  Scenario: A long markdown message overflows into a thread
    Given a Slack channel "alerts"
    When sending a Slack message with a markdown body of 80 alert bullets
    Then the first post is a top-level message
    And the first post announces 40 more in thread
    And the overflow is posted as a reply in the first post's thread
    And every posted bullet is intact

  Scenario: A short markdown message posts without a thread
    Given a Slack channel "alerts"
    When sending a Slack message with a markdown body of 30 alert bullets
    Then exactly one message is posted
    And the post is a top-level message

  Scenario: A repeated long message is debounced by its full body
    Given a Slack channel "alerts" which already received the same long message today
    When sending a Slack message with a markdown body of 80 alert bullets
    Then no new message is posted

  Scenario: Overflow replies do not recurse into deeper threads
    Given a Slack channel "alerts"
    When sending a Slack message with a markdown body of 80 alert bullets into thread "1111.2222"
    Then every post after the first stays in thread "1111.2222"
    And every posted bullet is intact
