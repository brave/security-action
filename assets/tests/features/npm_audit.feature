Feature: npm audit scanner
  The npm audit wrapper reports lock file findings with line numbers.

  Scenario: Direct lock file entry lookup
    Given a lock file containing
      """
      "lodash": {
        "version": "1.0.0"
      """
    Then the line for "lodash" is 2

  Scenario: Nested node names fall back to the stripped name
    Given a lock file containing
      """
      "lodash": {
        "version": "1.0.0"
      """
    Then the line for "node_modules/lodash" is 2

  Scenario: Unknown nodes raise StopIteration
    Given a lock file containing
      """
      "lodash": {
      """
    Then looking up "missing" raises StopIteration

  Scenario: Unknown nested nodes raise StopIteration after fallback
    Given a lock file containing
      """
      "other": {
      """
    Then looking up "node_modules/missing" raises StopIteration

  Scenario: Only lock files are audited
    Given the changed files
      """
      src/index.js
      docs/readme.md
      """
    And a "high" vulnerability in "lodash" titled "Prototype pollution" with url "https://example.com/advisory"
    When the audit runs
    Then no vulnerability is reported

  Scenario: Vulnerable dependencies are reported with line numbers
    Given a lock file containing
      """
      "lodash": {
        "version": "1.0.0"
      """
    And the lock file is among the changed files
    And a "high" vulnerability in "lodash" titled "Prototype pollution" with url "https://example.com/advisory"
    When the audit runs
    Then the output matches the finding pattern
      """
      H:.+:2 Prototype pollution<br /><br />See https://example.com/advisory
      """

  Scenario: Vulnerabilities without a URL omit the reference
    Given a lock file containing
      """
      "lodash": {
      """
    And the lock file is among the changed files
    And a "moderate" vulnerability in "lodash" titled "Timing attack" without a url
    When the audit runs
    Then the output matches the finding pattern
      """
      M:.+:2 Timing attack
      """

  Scenario: Vulnerabilities reported via a string are skipped
    Given a lock file containing
      """
      "lodash": {
      """
    And the lock file is among the changed files
    And a "high" vulnerability in "lodash" reported via a string
    When the audit runs
    Then no vulnerability is reported

  Scenario: A node missing from the lock file aborts the audit
    Given a lock file containing
      """
      "other": {
      """
    And the lock file is among the changed files
    And a "high" vulnerability in "missing" titled "Prototype pollution" without a url
    When the audit runs
    Then the audit aborts with StopIteration
    And stderr mentions the node "missing"
