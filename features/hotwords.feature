Feature: PR hotwords monitoring
  Watch PR title and body for hotwords and post a monitoring notice.

  Scenario: Hotword in the title triggers a notice
    Given the PR title "Fix RCE in parser" and body "nothing to see"
    And the hotwords "rce\nremote code execution"
    When checking hotwords
    Then a hotword hit is reported
    And a monitoring comment is posted

  Scenario: Hotword in the body triggers a notice
    Given the PR title "Fix parser" and body "introduces a remote code execution gadget"
    And the hotwords "rce\nremote code execution"
    When checking hotwords
    Then a hotword hit is reported
    And a monitoring comment is posted

  Scenario: No hotword match
    Given the PR title "Fix parser" and body "safe change"
    And the hotwords "rce\nremote code execution"
    When checking hotwords
    Then no hotword hit is reported
    And no monitoring comment is posted

  Scenario: Matching is case insensitive
    Given the PR title "fix RCE in parser" and body "safe"
    And the hotwords "rce"
    When checking hotwords
    Then a hotword hit is reported

  Scenario: Existing identical comment prevents a repost
    Given the PR title "Fix RCE in parser" and body "nothing"
    And the hotwords "rce"
    And the monitoring comment is already posted
    When checking hotwords
    Then a hotword hit is reported
    And no monitoring comment is posted

  Scenario: All matched hotwords are listed in the notice
    Given the PR title "RCE via eval" and body "and a prototype pollution"
    And the hotwords "rce\nprototype pollution\nunused-word"
    When checking hotwords
    Then a hotword hit is reported
    And the monitoring comment mentions "rce, prototype pollution"
