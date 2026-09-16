Feature: Post runner findings as a GitHub pull-request review
  reviewdog posts each runner's findings as one pull-request review.
  GitHub rejects the whole POST when any finding anchors to a diff it
  cannot render ("Diff entry <path> diff is too large" for huge minified
  lines, e.g. scraped HTML fixtures). The poster retries once without those
  findings so the remaining ones still land, and only an unrecoverable
  posting failure lands in reviewdog.fail.log.

  Scenario: Findings post successfully
    Given a runner log with findings for "app/index.js" and "app/util.js"
    And a reviewdog that succeeds on the first post
    When the findings are posted for the runner
    Then reviewdog.fail.log is not created
    And the first post contains "app/index.js"
    And the first post contains "app/util.js"

  Scenario: Findings on unrenderable diffs are retried once without them
    Given a runner log with findings for "huge.html" and "app/index.js"
    And a reviewdog that rejects "huge.html" as too large on the first post and succeeds on the second
    When the findings are posted for the runner
    Then reviewdog.fail.log is not created
    And the first post contains "huge.html"
    And the second post does not contain "huge.html"
    And the second post contains "app/index.js"

  Scenario: All findings unrenderable retries empty and does not fail
    Given a runner log with findings for "huge.html" only
    And a reviewdog that rejects "huge.html" as too large on the first post and succeeds on the second
    When the findings are posted for the runner
    Then reviewdog.fail.log is not created
    And the second post is empty

  Scenario: Unrecoverable posting failure surfaces in the fail log
    Given a runner log with findings for "app/index.js"
    And a reviewdog that always fails with "Line could not be resolved"
    When the findings are posted for the runner
    Then reviewdog.fail.log contains "app/index.js"

  Scenario: Retry still failing surfaces in the fail log
    Given a runner log with findings for "huge.html" and "app/index.js"
    And a reviewdog that rejects "huge.html" as too large on every post
    When the findings are posted for the runner
    Then reviewdog.fail.log contains "app/index.js"
    And reviewdog.fail.log does not contain "huge.html"
