Feature: Renovate config sanity check
  Audit org repositories for a Renovate config that extends the
  shared company config.

  Background:
    Given org "test-org"

  Scenario: A repo extending the company config is compliant
    Given the org has active repos "repo-a"
    And repo "repo-a" has a renovate config extending "local>test-org/renovate-config"
    When running the renovate sanity check
    Then the check reports no problems

  Scenario: A repo extending the brave config is compliant
    Given the org has active repos "repo-a"
    And repo "repo-a" has a renovate config extending "local>brave/renovate-config"
    When running the renovate sanity check
    Then the check reports no problems

  Scenario: A repo with a foreign extends is noncompliant
    Given the org has active repos "repo-a"
    And repo "repo-a" has a renovate config extending "local>other/renovate-config"
    When running the renovate sanity check
    Then the check reports "https://github.com/test-org/repo-a does not extend the company renovate config!"

  Scenario: A repo without any renovate config is reported
    Given the org has active repos "repo-a"
    When running the renovate sanity check
    Then the check reports "https://github.com/test-org/repo-a does not have a renovate config!"

  Scenario: Renovate config in package.json is honoured
    Given the org has active repos "repo-a"
    And repo "repo-a" has a package.json with a renovate section extending "local>test-org/renovate-config"
    When running the renovate sanity check
    Then the check reports no problems

  Scenario: JSON5 renovate configs are parsed
    Given the org has active repos "repo-a"
    And repo "repo-a" has a JSON5 renovate config extending "local>test-org/renovate-config"
    When running the renovate sanity check
    Then the check reports no problems

  Scenario: Archived, disabled and forked repos are skipped
    Given the org has archived, disabled and forked repos "repo-a"
    When running the renovate sanity check
    Then the check reports no problems

  Scenario: Empty repositories are skipped
    Given the org has active repos "repo-a"
    And repo "repo-a" is an empty repository
    When running the renovate sanity check
    Then the check reports no problems

  Scenario: Configured repositories are skipped
    Given the org has active repos "repo-a"
    And the skipped repositories are "repo-a"
    When running the renovate sanity check
    Then the check reports no problems

  Scenario: Missing and noncompliant repos are combined in the report
    Given the org has active repos "repo-a" and "repo-b"
    And repo "repo-a" has a renovate config extending "local>other/renovate-config"
    When running the renovate sanity check
    Then the check reports "https://github.com/test-org/repo-a does not extend the company renovate config!"
    And the check reports "https://github.com/test-org/repo-b does not have a renovate config!"

  Scenario: A github client or token is required
    When running the renovate sanity check without a github client
    Then the action fails with "either githubToken or github is required!"
