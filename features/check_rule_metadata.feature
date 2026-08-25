Feature: Validating opengrep rule metadata
  Lint rule YAML files for required metadata fields and check the
  source URL and category values.

  Background:
    Given a temporary rules directory

  Scenario: A fully annotated rule passes
    Given a rule file "services/rule.yaml"
      """
      rules:
        - id: rule-one
          metadata:
            author: someone
            source: https://github.com/brave/security-action/blob/main/services/rule.yaml
            category: security
      """
    When checking rule metadata
    Then the check succeeds

  Scenario: Missing author is reported
    Given a rule file "services/rule.yaml"
      """
      rules:
        - id: rule-one
          metadata:
            source: https://github.com/brave/security-action/blob/main/services/rule.yaml
            category: security
      """
    When checking rule metadata
    Then the check fails with "Missing metadata.author"

  Scenario: Missing source is reported
    Given a rule file "services/rule.yaml"
      """
      rules:
        - id: rule-one
          metadata:
            author: someone
            category: security
      """
    When checking rule metadata
    Then the check fails with "Missing metadata.source"

  Scenario: A source URL pointing elsewhere is reported
    Given a rule file "services/rule.yaml"
      """
      rules:
        - id: rule-one
          metadata:
            author: someone
            source: https://example.com/rule.yaml
            category: security
      """
    When checking rule metadata
    Then the check fails with "metadata.source is"
    And the check fails with "but should be"

  Scenario: An unknown category is reported
    Given a rule file "services/rule.yaml"
      """
      rules:
        - id: rule-one
          metadata:
            author: someone
            source: https://github.com/brave/security-action/blob/main/services/rule.yaml
            category: style
      """
    When checking rule metadata
    Then the check fails with "metadata.category must be either"

  Scenario: A document without a rules array is reported
    Given a rule file "services/rule.yaml"
      """
      patterns: []
      """
    When checking rule metadata
    Then the check fails with "No rules array found"

  Scenario: Broken YAML is reported
    Given a rule file "services/rule.yaml"
      """
      rules: [ unclosed
      """
    When checking rule metadata
    Then the check fails with "Failed to parse YAML"

  Scenario: Rule test files are skipped
    Given a rule file "services/rule.test.yaml"
      """
      rules:
        - id: rule-one
          metadata:
            category: style
      """
    When checking rule metadata
    Then the check succeeds

  Scenario: Rules without an id fall back to their index
    Given a rule file "services/rule.yaml"
      """
      rules:
        - metadata:
            category: security
      """
    When checking rule metadata
    Then the check fails with "[rule-0]"

  Scenario: A missing directory fails the check
    Given the rules directory does not exist
    When checking rule metadata
    Then the check fails with "Directory not found"

  Scenario: The CLI exits with a failure code on errors
    Given a rule file "services/rule.yaml"
      """
      rules:
        - id: rule-one
      """
    When checking rule metadata with exit codes
    Then the check fails with "Missing metadata.author"
    And the process exited with code 1

  Scenario: The CLI exits successfully when everything passes
    Given a rule file "services/rule.yaml"
      """
      rules:
        - id: rule-one
          metadata:
            author: someone
            source: https://github.com/brave/security-action/blob/main/services/rule.yaml
            category: security
      """
    When checking rule metadata with exit codes
    Then the check succeeds
    And the process exited with code 0
