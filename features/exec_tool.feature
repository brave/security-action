Feature: Landlock-backed exec tool
  The triage agent can run verification commands (e.g. python3 constant
  folding) through the Landlock wrapper with no network access, a
  stripped environment and a writable scratch directory only.

  Background:
    Given a repo workspace at "/repo" with action root "/action"
    And an exec tool with a fake spawn

  Scenario: The command runs through the Landlock wrapper
    When the exec tool runs with command "python3 -c 'print(2+2)'"
    Then the spawned command contains "scripts/with-sandbox.sh"
    And the spawned command contains "--ignore-missing"
    And the spawned command contains '--ro "/action"'
    And the spawned command contains '--ro "/repo"'
    And the spawned command contains '--rwx "/tmp/scratch"'
    And the spawned command does not contain "connect-tcp"

  Scenario: The spawned environment is stripped to an allowlist
    Given the process environment carries a secret token
    When the exec tool runs with command "printenv"
    Then the spawned env has exactly the keys "PATH,TMPDIR,HOME"
    And the spawned env does not contain the secret token

  Scenario: The command runs from the repo workspace
    When the exec tool runs with command "pwd"
    Then the spawned cwd is "/repo"

  Scenario: Output captures stdout and stderr
    When the exec tool runs with command "ls /nope"
    Then the tool output contains "stdout: listing"
    And the tool output contains "stderr: missing"

  Scenario: A failing command still reports its exit code
    When the exec tool runs with command "false"
    Then the tool output contains "exit code 3"

  Scenario: A spawn failure marks the tool failed
    When the exec tool runs with a command that fails to spawn
    Then the tool fails with error containing "spawn missing-shell ENOENT"

  Scenario: A hanging command is killed after the timeout
    When the exec tool runs with a command that hangs
    Then the child was killed with "SIGKILL"
    And the tool output contains "timed out after 50ms"

  Scenario: An empty command is rejected without spawning
    When the exec tool runs with command ""
    Then the tool fails with error "exec requires a command"
    And no child was spawned

  Scenario: Output is truncated to the cap
    When the exec tool runs with command "cat big.txt"
    Then the tool output contains "[truncated]"
    And the tool output contains "exit code 3"