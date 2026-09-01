Feature: Dependabot nudge message reconciliation
  The daily dismiss run reconciles nudge threads: stale threads are
  deleted and threads with remaining alerts are refreshed. The severity
  threshold must match the one the week's nudge used, so a mid-week run
  never qualifies more alerts than the nudge actually posted.

  Scenario: Reconcile uses the nudge week's severity after a month boundary
    Given the reconcile runs on 2026-09-01
    And the repo "brave/app" has 5 open alerts
    When reconciling nudge messages
    Then the reconcile alert severity filter is "high,critical"

  Scenario: Reconcile uses the nudge week's severity during the first week of the month
    Given the reconcile runs on 2026-09-07
    And the repo "brave/app" has 2 open alerts
    When reconciling nudge messages
    Then the reconcile alert severity filter is "medium,high,critical"
