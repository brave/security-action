Feature: Opengrep installation
  Install the opengrep binary via a SHA256-pinned install script.
  Network, fs and exec are injected fakes.

  Scenario: Matching installation is reused
    Given opengrep "1.11.5" is already installed
    When installing opengrep
    Then the install script is not executed
    And no download happens

  Scenario: Outdated installation is replaced
    Given opengrep "1.10.0" is already installed
    And the install script downloads 100 bytes
    When installing opengrep
    Then the install script is executed with the pinned version
    And the temporary script is cleaned up

  Scenario: Missing binary triggers download
    Given no opengrep binary is installed
    And the install script downloads 100 bytes
    When installing opengrep
    Then the install script is executed with the pinned version

  Scenario: Broken binary triggers reinstall
    Given the opengrep binary exists but --version fails
    And the install script downloads 100 bytes
    When installing opengrep
    Then the install script is executed with the pinned version

  Scenario: SHA256 mismatch aborts installation
    Given no opengrep binary is installed
    And the install script downloads 100 bytes with the wrong hash
    When installing opengrep
    Then the action fails with "SHA256 hash mismatch! Install script may have been tampered with."
    And the install script is not executed

  Scenario: Download failure aborts installation
    Given no opengrep binary is installed
    And the install script download fails with "Failed to download: HTTP 404"
    When installing opengrep
    Then the action fails with "Failed to download: HTTP 404"

  Scenario: Failing install script still cleans up
    Given no opengrep binary is installed
    And the install script downloads 100 bytes
    And the install script execution fails with "bash exploded"
    When installing opengrep
    Then the action fails with "bash exploded"
    And the temporary script is cleaned up

  Scenario: GITHUB_PATH receives the opengrep directory
    Given no opengrep binary is installed
    And the install script downloads 100 bytes
    And GITHUB_PATH is set
    When installing opengrep
    Then GITHUB_PATH receives the opengrep directory

  Scenario: The install script is written as executable
    Given no opengrep binary is installed
    And the install script downloads 100 bytes
    When installing opengrep
    Then the install script is written as executable
