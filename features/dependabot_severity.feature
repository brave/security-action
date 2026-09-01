Feature: Dependabot severity constants
  Shared severity ordering, skip hotwords and date-based nudge severity
  used by the nudge, dismiss and reconciliation modules.

  Scenario: Severity levels are ordered low to critical
    Then the severity order is "low,medium,high,critical"

  Scenario: Keys at or above a given level
    Given the minimum level "high"
    Then the keys at or above are "high,critical"

  Scenario: Keys at or above the lowest level return every level
    Given the minimum level "low"
    Then the keys at or above are "low,medium,high,critical"

  Scenario: Keys accept a numeric level
    Given the minimum numeric level 2
    Then the keys at or above are "high,critical"

  Scenario: Unknown level returns no keys
    Given the minimum level "unknown"
    Then the keys at or above are ""

  Scenario: Nudge severity within the first week of the month
    Given today is 2026-03-03
    Then the nudge severity for today is "medium"

  Scenario: Nudge severity on day 7 boundary
    Given today is 2026-03-07
    Then the nudge severity for today is "medium"

  Scenario: Nudge severity after the first week of the month
    Given today is 2026-03-08
    Then the nudge severity for today is "high"

  Scenario: Default skip hotwords are defined
    Then the default skip hotwords include "dos" and "denial of service"

  Scenario: Nudge week severity after a month boundary uses the week's Monday
    Given today is 2026-09-01
    Then the nudge severity for the nudge week is "high"

  Scenario: Nudge week severity on the first Monday of the month
    Given today is 2026-09-07
    Then the nudge severity for the nudge week is "medium"

  Scenario: Nudge week severity later in the first week of the month
    Given today is 2026-09-10
    Then the nudge severity for the nudge week is "medium"

  Scenario: Nudge week severity on a Sunday uses its own week's Monday
    Given today is 2026-09-06
    Then the nudge severity for the nudge week is "high"

  Scenario: Nudge week severity for a mid-month week
    Given today is 2026-09-15
    Then the nudge severity for the nudge week is "high"
