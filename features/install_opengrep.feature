Feature: Opengrep installation
  Install the opengrep binary by downloading the pinned release asset
  directly and verifying its SHA256 — no upstream install script is ever
  executed. Network, fs and exec are injected fakes.

  Scenario: Matching installation is reused
    Given the pinned opengrep version is already installed
    When installing opengrep
    Then no download happens
    And no symlink is created
    And the installed binary is hash checked

  Scenario: Tampered existing installation fails closed
    Given the pinned opengrep version is already installed
    And the installed binary does not match the pinned digest
    When installing opengrep
    Then the action fails with "SHA256 hash mismatch! Opengrep binary may have been tampered with."
    And no download happens

  Scenario: Missing binary digest fails closed
    Given no opengrep binary is installed
    And no binary digest is pinned
    When installing opengrep
    Then the action fails with no pinned binary digest
    And no download happens

  Scenario: Outdated installation is replaced
    Given opengrep "1.10.0" is already installed
    And the pinned release asset downloads 100 bytes
    When installing opengrep
    Then the binary is downloaded from the pinned release URL
    And the opengrep binary is written as executable
    And the latest symlink points at the version directory
    And the installed binary is hash checked

  Scenario: Missing binary triggers download
    Given no opengrep binary is installed
    And the pinned release asset downloads 100 bytes
    When installing opengrep
    Then the binary is downloaded from the pinned release URL
    And the installed binary is hash checked

  Scenario: Broken binary triggers reinstall
    Given the opengrep binary exists but --version fails
    And the pinned release asset downloads 100 bytes
    When installing opengrep
    Then the binary is downloaded from the pinned release URL
    And the installed binary is hash checked

  Scenario: SHA256 mismatch aborts installation
    Given no opengrep binary is installed
    And the pinned release asset downloads 100 bytes with the wrong hash
    When installing opengrep
    Then the action fails with "SHA256 hash mismatch! Opengrep binary may have been tampered with."
    And no symlink is created

  Scenario: Download failure aborts installation
    Given no opengrep binary is installed
    And the opengrep asset download fails with "Failed to download: HTTP 404"
    When installing opengrep
    Then the action fails with "Failed to download: HTTP 404"

  Scenario: Failing smoke test fails closed
    Given no opengrep binary is installed
    And the pinned release asset downloads 100 bytes
    And the version smoke test fails with "smoke exploded"
    When installing opengrep
    Then the action fails with "Installed opengrep binary failed the --version smoke test."

  Scenario: GITHUB_PATH receives the opengrep directory
    Given no opengrep binary is installed
    And the pinned release asset downloads 100 bytes
    And GITHUB_PATH is set
    When installing opengrep
    Then GITHUB_PATH receives the opengrep directory

  Scenario: The aarch64 release asset is pinned
    Then the opengrep pins include the aarch64 release asset