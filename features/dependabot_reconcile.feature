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

  Scenario: Daily reconcile adds no notifications to a completed thread
    Given the reconcile runs on 2026-09-01
    And the repo "brave/app" has 5 open alerts
    And a completed nudge thread for "brave/app" built from 5 alerts
    When reconciling nudge messages
    Then no replies are posted to the thread
    And the parent still shows 5 open Dependabot issues

  Scenario: Alerts added mid-week wait for the next weekly nudge
    Given the reconcile runs on 2026-09-01
    And the repo "brave/app" has 6 open alerts
    And a completed nudge thread for "brave/app" built from 5 alerts
    When reconciling nudge messages
    Then no replies are posted to the thread
    And the parent still shows 5 open Dependabot issues

  Scenario: Alerts resolved mid-week are trimmed silently
    Given the reconcile runs on 2026-09-01
    And the repo "brave/app" has 4 open alerts
    And a completed nudge thread for "brave/app" built from 5 alerts
    When reconciling nudge messages
    Then no replies are posted to the thread
    And the parent shows 4 open Dependabot issues

  Scenario: A thread whose alerts are all gone is cleaned up
    Given the reconcile runs on 2026-09-01
    And the repo "brave/app" has 0 open alerts
    And a completed nudge thread for "brave/app" built from 5 alerts
    When reconciling nudge messages
    Then no replies are posted to the thread
    And the stale nudge messages are deleted

  Scenario: An incomplete thread is finished by the reconcile
    Given the reconcile runs on 2026-09-01
    And the repo "brave/app" has 5 open alerts
    And an incomplete nudge thread for "brave/app" built from 5 alerts
    When reconciling nudge messages
    Then the thread is completed with exactly one cc reply

  Scenario: The weekly nudge path still appends to a completed thread
    Given the repo "brave/app" has 6 open alerts
    And a completed nudge thread for "brave/app" built from 5 alerts
    When refreshing the nudge thread in notify mode
    Then the thread has 1 new alert replies

  Scenario: A pre-grouping thread with duplicate advisories heals
    Given the reconcile runs on 2026-09-01
    And the repo "brave/app" has 2 duplicate-advisory alerts
    And a legacy nudge thread for "brave/app" with one reply per alert
    When reconciling nudge messages
    Then no replies are posted to the thread
    And the parent shows 1 open Dependabot issues
