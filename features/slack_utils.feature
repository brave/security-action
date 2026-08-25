Feature: Slack utilities
  Shared Slack SDK helpers: channel resolution, paginated history and
  thread fetching, message chunking, bot ownership and deletion with
  reply handling.

  Scenario: Resolving a channel name with the hash prefix
    Given a Slack client whose channels include "secops-hotspots"
    When resolving the channel "#secops-hotspots"
    Then the channel id is resolved

  Scenario: Resolving a channel name without the hash prefix
    Given a Slack client whose channels include "secops-hotspots"
    When resolving the channel "secops-hotspots"
    Then the channel id is resolved

  Scenario: Channel resolution paginates until found
    Given a Slack client where "secops-hotspots" is on the second page
    When resolving the channel "#secops-hotspots"
    Then the channel id is resolved
    And the client listed channels twice

  Scenario: Unknown channel throws
    Given a Slack client whose channels include "general"
    When resolving the channel "#nonexistent"
    Then resolving fails with "channel not found"

  Scenario: History fetches a single page
    Given a Slack client with two messages in history
    When fetching messages for the last seven days
    Then two messages are returned

  Scenario: History pagination follows the cursor
    Given a Slack client with paginated history
    When fetching messages for the last seven days
    Then all pages are returned
    And the client fetched history twice

  Scenario: Thread replies paginate until Slack has no more
    Given a Slack client with paginated thread replies
    When fetching replies of thread "1111.2222"
    Then all reply pages are returned

  Scenario: Nudge message chunking splits on the alert separator
    When chunking a message of three alerts with one alert per chunk
    Then three chunks are produced

  Scenario: Empty alert parts are dropped when chunking
    When chunking a message with blank alert parts with one alert per chunk
    Then no empty chunk is produced

  Scenario: Chunk size groups several alerts per chunk
    When chunking a message of three alerts with two alerts per chunk
    Then two chunks are produced
    And the first chunk contains two alerts

  Scenario: A message with no separators yields a single chunk
    When chunking a plain message with one alert per chunk
    Then one chunk is produced

  Scenario: Bot ownership by bot id
    Given a message with bot id "B123"
    Then the message is owned by bot "B123"
    And the message is not owned by bot "B999"

  Scenario: Without a bot id only nudge metadata marks ownership
    Given a message with metadata event type "alerts"
    Then the message is bot owned without a bot id

    Given a plain user message
    Then the message is not bot owned without a bot id

  Scenario: Deleting a simple message deletes only itself
    Given a Slack client with one bot message without replies
    When deleting the messages
    Then the deletion count is one

  Scenario: Deleting a thread removes managed replies before the parent
    Given a Slack client with a bot thread parent with two managed replies
    When deleting the messages
    Then the deletion count is three
    And replies are deleted before their parent

  Scenario: Human replies preserve the thread parent
    Given a Slack client with a bot thread parent with one human reply
    When deleting the messages
    Then the deletion count is zero

  Scenario: Deletion failure stops the thread midway
    Given a Slack client with a bot thread parent with two managed replies and a failing delete
    When deleting the messages
    Then the deletion stops after the first failure

  Scenario: Debug mode counts deletions without calling the API
    Given a Slack client with two bot messages without replies
    When deleting the messages in debug mode
    Then the debug deletion count is two
    And no API deletion happened

  Scenario: Preparing a context resolves the channel and fetches history
    Given a Slack client whose channels include "secops-hotspots" and two messages in history
    When preparing a Slack context for channel "#secops-hotspots"
    Then the context has a resolved channel id
    And the context holds the fetched messages
