Feature: Deleting Slack messages by repo
  List repos that have bot messages in a channel and delete those
  messages by repo name.

  Scenario: Repo extraction prefers message metadata
    Given a Slack message with metadata repo "org/repo"
    Then the extracted repo is "org/repo"

  Scenario: Repo extraction falls back to a GitHub url in the text
    Given a Slack message with text "see https://github.com/org/repo/pull/1"
    Then the extracted repo is "org/repo"

  Scenario: Repo extraction reads blocks and attachments
    Given a Slack message with a block linking "https://github.com/org/repo"
    Then the extracted repo is "org/repo"

  Scenario: Arbitrary word pairs do not look like repos
    Given a Slack message with text "just some/words here"
    Then no repo is extracted

  Scenario: Listing repos filters by username
    Given a Slack channel with messages from "github-actions" and "someone-else" for repos "org/one" and "org/two"
    When listing repos for username "github-actions"
    Then the repos are "org/one"

  Scenario: Listing repos requires token, channel and username
    When listing repos without a username
    Then listing fails with "token, channel, and username are required!"

  Scenario: Deleting filters messages by repo
    Given a Slack channel with two github-actions messages for repos "org/one" and "org/two"
    When deleting messages for repos "org/one"
    Then one message is deleted

  Scenario: Deleting without repos does nothing
    Given a Slack channel with two github-actions messages for repos "org/one" and "org/two"
    When deleting messages for no repos
    Then no message is deleted

  Scenario: Deleting requires a token
    When deleting messages without a token
    Then deleting fails with "token is required!"

  Scenario: Deleting requires a channel
    When deleting messages without a channel
    Then deleting fails with "channel is required!"

  Scenario: Deleting requires a username
    When deleting messages without a username
    Then deleting fails with "username is required!"

  Scenario: Debug mode counts without deleting
    Given a Slack channel with two github-actions messages for repos "org/one" and "org/two"
    When deleting messages for repos "org/one" and "org/two" in debug mode
    Then two messages are counted
    And no deletion was performed
