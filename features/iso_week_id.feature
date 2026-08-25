Feature: ISO week identifier
  Compute the ISO 8601 week identifier ("YYYY-Www") for a date using UTC
  so the result is stable across timezones.

  Scenario: ISO week 1 on a Thursday New Year
    Given the date 2026-01-01
    When the ISO week id is computed
    Then the week id is "2026-W01"

  Scenario: New Year on Friday belongs to the previous year's week 53
    Given the date 2021-01-01
    When the ISO week id is computed
    Then the week id is "2020-W53"

  Scenario: Monday of a new ISO year
    Given the date 2019-12-30
    When the ISO week id is computed
    Then the week id is "2020-W01"

  Scenario: Sunday ending a 53-week year
    Given the date 2016-01-03
    When the ISO week id is computed
    Then the week id is "2015-W53"

  Scenario: Mid-year date
    Given the date 2025-07-09
    When the ISO week id is computed
    Then the week id is "2025-W28"

  Scenario: Time of day does not change the result
    Given the date 2026-08-25
    When the ISO week id is computed at 23:59:59.999
    Then the week id is "2026-W35"

  Scenario Outline: Every day of a year yields a well-formed week id
    Given the date <date>
    When the ISO week id is computed
    Then the week id is well-formed

    Examples:
      | date       |
      | 2024-02-29 |
      | 2024-12-31 |
      | 2025-01-01 |
      | 2025-06-15 |
      | 2025-12-31 |
