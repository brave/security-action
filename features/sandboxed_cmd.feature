Feature: Sandboxed command builder
  Build shell commands that run a command inside the Landlock wrapper with
  action-scoped grants: the action tree is read-only, git metadata is
  writable, listed paths get the requested rights and egress stays closed
  unless explicitly opened to TLS 443.

  Scenario: Git clone command is sandboxed with TLS egress and a writable target
    Given a sandboxed command for action path "/act" cmd "git clone --depth 1 https://github.com/o/r.git /tmp/scan" with write dirs ["/tmp/scan"] and egress on
    Then the command runs inside the sandbox wrapper
    And the action tree is read-only
    And the target is writable and TLS 443 is the only egress

  Scenario: Local git command is sandboxed with no network
    Given a sandboxed command for action path "/act" cmd "git diff --name-only origin/main...HEAD" with write dirs [] and egress off
    Then the command runs inside the sandbox wrapper
    And the action tree is read-only and git metadata writable
    And no egress is granted

  Scenario: Shell payloads are passed through bash -c with single-quote escaping
    Given a sandboxed command for action path "/act" cmd "cd /rules && echo 'quote-marker' && opengrep --json . 2>/dev/null || true" with write dirs [] and egress off
    Then the payload is wrapped in bash -c
    And single quotes inside the payload are escaped

  Scenario: Cache paths are granted as writable
    Given a sandboxed command for action path "/act" cmd "opengrep --json ." with write dirs ["/home/u/.cache/opengrep", "/home/u/.opengrep/semgrep.log"] and egress off
    And the read dirs ["/rules", "/scan-target"]
    Then the cache paths are writable and the read dirs are read-only
    And no egress is granted