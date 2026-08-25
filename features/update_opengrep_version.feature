Feature: Opengrep version update
  Update the pinned version and install script hash in installOpengrep.js.
  Network and fs are injected fakes.

  Scenario: Already up to date
    Given the installed version is "v1.11.5"
    And the latest release is "v1.11.5"
    When updating the opengrep version
    Then the result reports no update
    And the file is not modified

  Scenario: New version is pinned with the downloaded script hash
    Given the installed version is "v1.11.5"
    And the latest release is "v1.12.0"
    And the pinned script downloads 50 bytes
    When updating the opengrep version
    Then the result reports an update from "v1.11.5" to "v1.12.0"
    And the file pins version "v1.12.0"
    And the file pins the downloaded script hash

  Scenario: Unparseable current version still updates
    Given the installed version cannot be parsed
    And the latest release is "v1.12.0"
    And the pinned script downloads 50 bytes
    When updating the opengrep version
    Then the result reports an update with no previous version

  Scenario: Release fetch failure
    Given the installed version is "v1.11.5"
    And the release fetch fails with "Failed to fetch release: HTTP 403"
    When updating the opengrep version
    Then the action fails with "Failed to fetch release: HTTP 403"
    And the file is not modified

  Scenario: Install script download failure
    Given the installed version is "v1.11.5"
    And the latest release is "v1.12.0"
    And the pinned script download fails with "Failed to download: HTTP 404"
    When updating the opengrep version
    Then the action fails with "Failed to download: HTTP 404"
    And the file is not modified
