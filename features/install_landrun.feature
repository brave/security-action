Feature: Landrun installation
  Install the landrun binary by downloading a pinned release asset
  directly (no remote install script) and verifying its SHA256 digest
  on install and on every reuse. Network, fs and exec are injected fakes.

  Scenario: Matching installation is reused
    Given the pinned landrun version is already installed
    When installing landrun
    Then no landrun download happens
    And the installed landrun binary is hash checked

  Scenario: Tampered existing installation fails closed
    Given the pinned landrun version is already installed
    And the installed landrun binary does not match the pinned digest
    When installing landrun
    Then the action fails with "SHA256 hash mismatch! Landrun binary may have been tampered with."
    And no landrun download happens

  Scenario: Missing binary digest fails closed
    Given no landrun binary is installed
    And no landrun binary digest is pinned
    When installing landrun
    Then the action fails with no pinned landrun binary digest
    And no landrun download happens

  Scenario: Missing binary triggers download
    Given no landrun binary is installed
    And the downloaded landrun reports the pinned version
    And the release asset downloads "binary"
    When installing landrun
    Then the binary is written as executable
    And the installed landrun binary is hash checked
    And the landrun binary reports the pinned version
    And the install completes without error

  Scenario: Outdated installation is replaced
    Given landrun "0.1.16" is already installed
    And the downloaded landrun reports the pinned version
    And the release asset downloads "binary"
    When installing landrun
    Then the release asset is downloaded
    And the installed landrun binary is hash checked
    And the install completes without error

  Scenario: Broken binary triggers reinstall
    Given the landrun binary exists but --version fails
    And the downloaded landrun reports the pinned version
    And the release asset downloads "binary"
    When installing landrun
    Then the release asset is downloaded
    And the installed landrun binary is hash checked
    And the install completes without error

  Scenario: SHA256 mismatch aborts installation
    Given no landrun binary is installed
    And the release asset downloads "tampered"
    When installing landrun
    Then the action fails with "SHA256 hash mismatch! Landrun binary may have been tampered with."

  Scenario: Download failure aborts installation
    Given no landrun binary is installed
    And the release asset download fails with "Failed to download: HTTP 404"
    When installing landrun
    Then the action fails with "Failed to download: HTTP 404"

  Scenario: GITHUB_PATH receives the landrun directory
    Given no landrun binary is installed
    And the downloaded landrun reports the pinned version
    And GITHUB_PATH is set for the landrun install
    And the release asset downloads "binary"
    When installing landrun
    Then GITHUB_PATH receives the landrun directory
    And the install completes without error