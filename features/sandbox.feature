Feature: Landlock sandbox wrapper
  scripts/with-sandbox.sh runs a command inside a Landlock sandbox via
  landrun and fails closed when sandboxing is impossible on CI runners.
  Scenarios drive the real script with a stub landrun binary and a
  stand-in kernel LSM list file.

  Background:
    Given a sandbox test area

  Scenario: Command runs inside landrun with best-effort enforcement
    Given the landrun stub is available
    And the kernel LSM list includes landlock
    And the wrapper runs locally
    When running the wrapper with landrun args "--rw {tmpdir}" and command "/bin/echo sandboxed"
    Then the exit code is 0
    And the command output is "sandboxed"
    And landrun was invoked with "--best-effort" as its first argument
    And landrun received the wrapper args and the command

  Scenario: Non-zero exit codes pass through
    Given the landrun stub is available
    And the kernel LSM list includes landlock
    And the wrapper runs locally
    And a command script exiting with 3
    When running the wrapper with landrun args "--rw {tmpdir}"
    Then the exit code is 3

  Scenario: Missing landrun fails closed in CI
    Given no landrun binary is available
    And the kernel LSM list includes landlock
    And the wrapper runs in CI
    When running the wrapper with landrun args "--rw {tmpdir}" and command "/bin/echo hi"
    Then the exit code is 1
    And stderr mentions "Landlock sandbox unavailable"
    And the command was not executed

  Scenario: Missing landrun degrades locally with a warning
    Given no landrun binary is available
    And the kernel LSM list includes landlock
    And the wrapper runs locally
    When running the wrapper with landrun args "--rw {tmpdir}" and command "/bin/echo direct"
    Then the exit code is 0
    And stderr mentions "unsandboxed"
    And the command output is "direct"

  Scenario: Kernel without landlock fails closed in CI
    Given the landrun stub is available
    And the kernel LSM list does not include landlock
    And the wrapper runs in CI
    When running the wrapper with landrun args "--rw {tmpdir}" and command "/bin/echo hi"
    Then the exit code is 1
    And stderr mentions "Landlock sandbox unavailable"
    And the command was not executed

  Scenario: Kernel without landlock degrades locally with a warning
    Given the landrun stub is available
    And the kernel LSM list does not include landlock
    And the wrapper runs locally
    When running the wrapper with landrun args "--rw {tmpdir}" and command "/bin/echo degraded"
    Then the exit code is 0
    And stderr mentions "unsandboxed"
    And the command output is "degraded"

  Scenario: Missing LSM list fails closed in CI
    Given the landrun stub is available
    And the kernel LSM list is unavailable
    And the wrapper runs in CI
    When running the wrapper with landrun args "--rw {tmpdir}" and command "/bin/echo hi"
    Then the exit code is 1
    And stderr mentions "Landlock sandbox unavailable"
    And the command was not executed

  Scenario: Environment scrubbing hides secrets from the sandboxed command
    Given the landrun stub is available
    And the kernel LSM list includes landlock
    And the wrapper runs locally
    And the environment variable "REVIEWDOG_GITHUB_API_TOKEN" is "ghs-secret-value"
    And the environment variable "SANDBOX_FEATURE_CANARY" is "leak-me"
    And the sandboxed environment is scrubbed
    And a command script exiting with 0
    When running the wrapper with landrun args "--rox /usr"
    Then the exit code is 0
    And the sandboxed environment does not include "REVIEWDOG_GITHUB_API_TOKEN"
    And the sandboxed environment does not include "SANDBOX_FEATURE_CANARY"

  Scenario: Environment scrubbing keeps allowlisted variables
    Given the landrun stub is available
    And the kernel LSM list includes landlock
    And the wrapper runs locally
    And the environment variable "SCRIPTPATH" is "/action/assets"
    And the environment variable "PIP_AUDIT_VENV_BASE" is "/scratch/pip-venv"
    And the environment variable "PYPI_INDEX_URL" is "https://pypi.example/simple"
    And the sandboxed environment is scrubbed
    And a command script exiting with 0
    When running the wrapper with landrun args "--rox /usr"
    Then the exit code is 0
    And the sandboxed environment includes "SCRIPTPATH" with value "/action/assets"
    And the sandboxed environment includes "PIP_AUDIT_VENV_BASE" with value "/scratch/pip-venv"
    And the sandboxed environment includes "PYPI_INDEX_URL" with value "https://pypi.example/simple"

  Scenario: Environment is scrubbed by default, without SANDBOX_CLEAN_ENV
    Given the landrun stub is available
    And the kernel LSM list includes landlock
    And the wrapper runs locally
    And the environment variable "SANDBOX_FEATURE_CANARY" is "stripped"
    And the environment variable "RUNNER_TEMP" is "/home/runner/work/_temp"
    And a command script exiting with 0
    When running the wrapper with landrun args "--rox /usr"
    Then the exit code is 0
    And the sandboxed environment does not include "SANDBOX_FEATURE_CANARY"
    And the sandboxed environment includes "RUNNER_TEMP" with value "/home/runner/work/_temp"

  Scenario: SANDBOX_ENV_EXTRA passes additional variable names through
    Given the landrun stub is available
    And the kernel LSM list includes landlock
    And the wrapper runs locally
    And the environment variable "MY_TOOL_REGISTRY" is "https://reg.example"
    And the environment variable "SANDBOX_ENV_EXTRA" is "MY_TOOL_REGISTRY"
    And the environment variable "SANDBOX_FEATURE_CANARY" is "hidden"
    And a command script exiting with 0
    When running the wrapper with landrun args "--rox /usr"
    Then the exit code is 0
    And the sandboxed environment includes "MY_TOOL_REGISTRY" with value "https://reg.example"
    And the sandboxed environment does not include "SANDBOX_FEATURE_CANARY"