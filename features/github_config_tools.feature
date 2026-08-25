Feature: GitHub repository config and property tools
  Fetch JSON config files and custom properties from GitHub
  repositories, with empty-object fallbacks on failure.

  Background:
    Given a GitHub client for org "test-org" repo "test-repo"

  Scenario: Config file content is parsed as JSON
    Given the repo has a config file "config.json" with content
      | slack  | #secops |
      | hot    | words   |
    When fetching the config file "config.json"
    Then the config value for "slack" is "#secops"
    And the config value for "hot" is "words"

  Scenario: A broken config file returns an empty object
    Given the repo has a broken config file "config.json"
    When fetching the config file "config.json"
    Then the config is empty

  Scenario: A missing config file returns an empty object
    When fetching the config file "missing.json"
    Then the config is empty

  Scenario: Properties are copied unchanged when not matching the prefix
    Given the repo has properties
      | runtime     | node  |
      | maintainers | alice |
    When fetching the repo properties with prefix "x_"
    Then the property "runtime" is "node"
    And the property "maintainers" is "alice"

  Scenario: Prefixed properties are renamed and unprefixed ones kept
    Given the repo has properties
      | brave_runtime | node  |
      | maintainers   | alice |
    When fetching the repo properties with prefix "brave_"
    Then the property "runtime" is "node"
    And the property "maintainers" is "alice"
    And the property "brave_runtime" is undefined

  Scenario: A properties failure returns an empty object
    Given the repo properties request fails
    When fetching the repo properties
    Then the config is empty

  Scenario: An empty prefix excludes every property
    Given the repo has properties
      | brave_runtime | node |
    When fetching the repo properties with prefix ""
    Then the config is empty
