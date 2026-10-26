Feature: Sentry cron check-ins
  Scheduled workflows check in to Sentry Crons as a deadman switch:
  an in_progress check-in upserts the monitor (crontab schedule, grace
  margin), a terminal check-in reports ok or error. The check-in URL is
  a semi-secret ingest credential and must never appear in logs. When
  SENTRY_CRON_URL is unset the check-in is a silent no-op so wiring can
  ship before the org secret exists.

  Scenario: Missing check-in URL is a silent no-op
    Given no SENTRY_CRON_URL is configured
    When checking in "ok" for monitor "workflows-dependabot-nudge" with schedule "" and margin ""
    Then no HTTP request is made
    And the check-in completes without error

  Scenario: Missing status input is a silent no-op
    Given no SENTRY_CRON_URL is configured
    When checking in "" for monitor "workflows-dependabot-nudge" with schedule "" and margin ""
    Then no HTTP request is made
    And the check-in completes without error

  Scenario: in_progress upserts the monitor schedule
    Given a local capture server standing in for the Sentry ingest
    And SENTRY_CRON_URL points at the capture server
    When checking in "in_progress" for monitor "workflows-dependabot-nudge" with schedule "0 17 * * 1" and margin "120"
    Then the ingest receives a POST with body:
    """
    {"status":"in_progress","monitor_config":{"schedule":{"type":"crontab","value":"0 17 * * 1"},"timezone":"UTC","checkin_margin":120}}
    """
    And the check-in completes without error

  Scenario: in_progress without schedule omits monitor_config
    Given a local capture server standing in for the Sentry ingest
    And SENTRY_CRON_URL points at the capture server
    When checking in "in_progress" for monitor "workflows-check-new-repos" with schedule "" and margin ""
    Then the ingest receives a POST with body:
    """
    {"status":"in_progress"}
    """
    And the check-in completes without error

  Scenario: ok closes the check-in
    Given a local capture server standing in for the Sentry ingest
    And SENTRY_CRON_URL points at the capture server
    When checking in "ok" for monitor "workflows-dependabot-nudge" with schedule "" and margin ""
    Then the ingest receives a GET for status "ok"
    And the check-in completes without error

  Scenario: error reports the failure
    Given a local capture server standing in for the Sentry ingest
    And SENTRY_CRON_URL points at the capture server
    When checking in "error" for monitor "workflows-dependabot-nudge" with schedule "" and margin ""
    Then the ingest receives a GET for status "error"
    And the check-in completes without error

  Scenario: Unreachable ingest never breaks the workflow
    Given SENTRY_CRON_URL points at a closed port
    When checking in "ok" for monitor "workflows-dependabot-nudge" with schedule "" and margin ""
    Then no HTTP request is received by the capture server
    And the check-in completes without error

  Scenario: The ingest URL never leaks into logs
    Given a local capture server standing in for the Sentry ingest
    And SENTRY_CRON_URL points at the capture server
    When checking in "in_progress" for monitor "workflows-dependabot-nudge" with schedule "0 17 * * 1" and margin "120"
    Then the check-in output does not contain the check-in URL