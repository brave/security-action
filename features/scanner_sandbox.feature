Feature: Sandbox reviewdog scanners
  Scanners parse PR-controlled files with native parsers, so they run inside
  the Landlock sandbox with a read-only workspace and no network egress,
  except npm-audit which may talk to the npm registry over TLS.

  Scenario: The opengrep scanner is sandboxed with no network
    When the reviewdog configuration is loaded
    Then the opengrep command wraps opengrep with the sandbox wrapper
    And the opengrep sandbox has no network access
    And the opengrep command disables the version check and metrics

  Scenario: The sveltegrep scanner extracts scripts into a temp directory
    When the reviewdog configuration is loaded
    Then the sveltegrep extraction commands write to a temp output directory
    And the sveltegrep opengrep scan runs over the temp directory
    And the sveltegrep sandbox has no network access
    And the sveltegrep temp directory is cleaned up after the scan

  Scenario: The safesvg scanner validates SVGs in the sandbox
    When the reviewdog configuration is loaded
    Then the safesvg command wraps xmllint with the sandbox wrapper
    And the safesvg sandbox has no network access

  Scenario: The npm-audit scanner talks only to the registry
    When the reviewdog configuration is loaded
    Then the npm-audit command wraps python3 with the sandbox wrapper
    And the npm-audit sandbox allows outbound TCP on port 443 only
    And the npm-audit sandbox grants only the changed package-lock.json files, not the workspace
    And the npm-audit grant loop tolerates a missing trailing newline

  Scenario: modelscan runs without network or workspace writes
    When the modelscan post comments script is loaded
    Then modelscan runs through the sandbox wrapper
    And the modelscan sandbox has no network access