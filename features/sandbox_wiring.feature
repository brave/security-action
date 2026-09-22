Feature: Sandboxed runner wiring
  The reviewdog runner configuration routes untrusted-input scanners
  through the Landlock wrapper so their file-system and network access
  stays inside a policy allowlist.

  Scenario: The pip-audit runner command is sandboxed
    When the reviewdog configuration is loaded
    Then the pip-audit command wraps python3 with the sandbox wrapper
    And the pip-audit sandbox grants write access only to the venv temp directory
    And the pip-audit sandbox allows outbound TCP on port 443 only
    And the pip-audit sandbox allows the action venv and toolchain read+execute
    And the pip-audit sandbox scrubs the environment