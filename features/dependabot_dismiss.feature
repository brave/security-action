Feature: Dismissing Dependabot alerts
  Dismiss org-wide Dependabot alerts whose advisory summary matches a
  hotword or whose GHSA/CVE id is on the dismiss list.

  Background:
    Given org "test-org"

  Scenario: Alerts matching a hotword are dismissed
    Given the org has open dependabot alerts
      | 1      | Denial of service in lodash    | GHSA-aa   | repo1 |
      | 2      | Buffer overflow in parser      | GHSA-bb   | repo2 |
    When dismissing alerts
    Then 1 alert is dismissed
    And the dismissed comment for alert 1 contains the hotword "denial of service"

  Scenario: Alerts on the dismiss list are dismissed by id
    Given a dismiss list file containing "GHSA-cc" and "CVE-1999-1234"
    And the org has open dependabot alerts
      | 1 | Denial of service in lodash | GHSA-aa   | CVE-1999-0001 | repo1 |
      | 2 | Buffer overflow in parser   | GHSA-bb   | CVE-1999-1234 | repo2 |
      | 3 | Header injection in blog    | GHSA-cc   | CVE-1999-2222 | repo2 |
    When dismissing alerts
    Then 3 alerts are dismissed
    And the dismissed comment for alert 1 contains the hotword "denial of service"
    And the dismissed comment for alert 2 contains the id "CVE-1999-1234"
    And the dismissed comment for alert 3 contains the id "GHSA-cc"

  Scenario: Nothing matches leaves the org untouched
    Given the org has open dependabot alerts
      | 1      | Buffer overflow in parser   | GHSA-bb   | repo1 |
    When dismissing alerts
    Then 0 alerts are dismissed
    And the dismissal message is empty
    And no repositories are in the dismissed list

  Scenario: The dismissal message lists matching alerts and repos
    Given the org has open dependabot alerts
      | 1      | Denial of service in lodash | GHSA-aa   | repo1 |
      | 2      | ReDoS in minimatch          | GHSA-bb   | repo1 |
    When dismissing alerts
    Then the dismissal message contains "Denial of service in lodash"
    And the dismissal message contains "ReDoS in minimatch"
    And the dismissed repos are "test-org/repo1"

  Scenario: Debug mode reports but does not dismiss
    Given the org has open dependabot alerts
      | 1      | Denial of service in lodash | GHSA-aa   | repo1 |
    When dismissing alerts in debug mode
    Then 0 alerts are dismissed
    And the dismissal message contains "Denial of service in lodash"

  Scenario: The severity filter covers the levels at or above the minimum
    Given the org has open dependabot alerts
      | 1      | Denial of service in lodash | GHSA-aa   | repo1 |
    When dismissing alerts with minlevel "high"
    Then the paginate severity filter is "high,critical"

  Scenario: A missing dismiss list file is tolerated
    Given the org has open dependabot alerts
      | 1      | Denial of service in lodash | GHSA-aa   | repo1 |
    When dismissing alerts with a missing dismiss list
    Then 1 alert is dismissed

  Scenario: Repeated dismissals of one advisory in one repo group into one line
    Given the org has open dependabot alerts
      | 3      | qs: DoS via isBuffer in search | GHSA-aa | repo2 |
      | 1      | qs: DoS via isBuffer in search | GHSA-aa | repo1 |
      | 2      | qs: DoS via isBuffer in search | GHSA-aa | repo1 |
    When dismissing alerts
    Then the dismissal message is:
      """
      The following alerts were dismissed:

      - [qs: DoS via isBuffer in search in `test-org/repo1`](https://github.com/test-org/repo1/dependabot/alert/1) (also in [#2](https://github.com/test-org/repo1/dependabot/alert/2))
      - [qs: DoS via isBuffer in search in `test-org/repo2`](https://github.com/test-org/repo2/dependabot/alert/3)
      """

  Scenario: The dismissal message is sorted by package
    Given a dismiss list file containing "GHSA-aa" and "GHSA-bb"
    And the org has open dependabot alerts
      | 2      | Zeta overflow in parser | GHSA-bb | repo1 |
      | 1      | Alpha leak in transport | GHSA-aa | repo2 |
    When dismissing alerts
    Then the dismissal message is:
      """
      The following alerts were dismissed:

      - [Alpha leak in transport in `test-org/repo2`](https://github.com/test-org/repo2/dependabot/alert/1)
      - [Zeta overflow in parser in `test-org/repo1`](https://github.com/test-org/repo1/dependabot/alert/2)
      """
