Feature: Triage action config plumbing
  As the security action maintainer
  I want triage options flowing from the action config to the in-reviewdog filter
  So repositories opt in to FP triage without touching the pipeline

  Scenario: Disabled by default
    Given default action options
    When the triage config is written to a capture dir
    Then the triage config is disabled
    And the triage model is "z-ai/glm-5.3-flash"
    And the triage budget is 1 usd
    And the triage max findings is 50

  Scenario: Options enable and parameterize the filter
    Given action options with triage enabled model "deepseek/deepseek-v4.1-flash-1017" budget "2.50" max findings "20"
    When the triage config is written to a capture dir
    Then the triage config is enabled
    And the triage model is "deepseek/deepseek-v4.1-flash-1017"
    And the triage budget is 2.5 usd
    And the triage max findings is 20
    And the triage config carries the OPENROUTER_API_KEY env

  Scenario: Summaries aggregate into a Slack line
    Given a capture dir with triage summaries for opengrep and sveltegrep
    When the triage summaries are read
    Then the summary line contains "1 suppressed, 2 annotated"
    And the summary cost is 0.0004 usd

  Scenario: No summaries means no Slack line
    Given an empty capture dir
    When the triage summaries are read
    Then the summary line is empty
