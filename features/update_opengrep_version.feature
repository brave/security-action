Feature: Opengrep version update
  Update the pinned version, binary digests and the action.yml cache key.
  Network and fs are injected fakes.

  Scenario: Already up to date
    Given the installed version is "v1.11.5"
    And the latest release is "v1.11.5"
    When updating the opengrep version
    Then the result reports no update
    And the file is not modified

  Scenario: New version is pinned with the downloaded script hash and binary digests
    Given the installed version is "v1.11.5"
    And the latest release is "v1.12.0"
    And the release binaries download for the pinned dists
    When updating the opengrep version
    Then the result reports an update from "v1.11.5" to "v1.12.0"
    And the file pins version "v1.12.0"
    And the file pins binary digests for "v1.12.0"
    And the cache key pins version "v1.12.0"

  Scenario: Unparseable current version still updates
    Given the installed version cannot be parsed
    And the latest release is "v1.12.0"
    And the release binaries download for the pinned dists
    When updating the opengrep version
    Then the result reports an update with no previous version

  Scenario: Release fetch failure
    Given the installed version is "v1.11.5"
    And the release fetch fails with "Failed to fetch release: HTTP 403"
    When updating the opengrep version
    Then the action fails with "Failed to fetch release: HTTP 403"
    And the file is not modified

  Scenario: Binary download failure leaves the files untouched
    Given the installed version is "v1.11.5"
    And the latest release is "v1.12.0"
    And the release binary download fails with "Failed to download: HTTP 404"
    When updating the opengrep version
    Then the action fails with "Failed to download: HTTP 404"
    And the file is not modified