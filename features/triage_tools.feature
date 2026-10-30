Feature: Harness tool registry
  As the agentic triage harness
  I want read-only repository tools with a fail-closed exec
  So that the model can navigate code without mutating anything

  Background:
    Given a tool registry rooted at "/repo" with files:
      | path                        | content                              |
      | src/App.java                | class App {\n  int f() {\n    return 1;\n  }\n} |
      | src/Util.java               | String escape(String s) { return s; } |
      | docs/readme.md              | hello                                |

  Scenario: View returns numbered lines for the whole file
    When the view tool runs with file "src/App.java"
    Then the tool output contains "1: class App {"
    And the tool output contains "5: }"

  Scenario: View honors a line range
    When the view tool runs with file "src/App.java", start line 2 and end line 3
    Then the tool output is "2:   int f() {\n3:     return 1;"

  Scenario: View of a missing file is a tool error
    When the view tool runs with file "missing.java"
    Then the tool fails with error "file not found"

  Scenario: Grep finds pattern matches across files
    When the grep tool runs with pattern "escape"
    Then the tool output contains "/repo/src/Util.java:1: String escape"
    And the tool output does not contain "docs/readme.md"

  Scenario: Grep with a glob restricts searched files
    When the grep tool runs with pattern "hello" and glob "src/**"
    Then the tool output is "no matches"

  Scenario: Grep with no matches reports so
    When the grep tool runs with pattern "zzz_not_there"
    Then the tool output is "no matches"

  Scenario: Find lists files matching a glob
    When the find tool runs with pattern "src/**/*.java"
    Then the tool output contains "/repo/src/App.java"
    And the tool output contains "/repo/src/Util.java"
    And the tool output does not contain "docs/readme.md"

  Scenario: Exec is fail-closed when not configured
    When the exec tool runs with command "cat src/App.java"
    Then the tool fails with error "exec tool not configured"

  Scenario: Exec passes through to the injected runner
    Given an exec runner that returns "ok ran: {command}"
    When the exec tool runs with command "cat src/App.java"
    Then the tool output is "ok ran: cat src/App.java"

  Scenario: Exec runner failure surfaces as a tool error
    Given an exec runner that throws "sandbox denied"
    When the exec tool runs with command "cat src/App.java"
    Then the tool fails with error "sandbox denied"

  Scenario: Websearch is fail-closed when not configured
    When the websearch tool runs with query "fastify defaultTyping"
    Then the tool fails with error "search tool not configured"

  Scenario: Websearch passes through to the injected search
    Given a search tool that returns "1. Fastify CVE\n   https://example.com"
    When the websearch tool runs with query "fastify defaultTyping"
    Then the tool output contains "https://example.com"

  Scenario: The done tool echoes its arguments
    When the done tool runs with verdict arguments
    Then the done tool echoes its arguments

  Scenario: The registry lists read-only tools only
    Then the registry exposes the tools "view, grep, find, done"

  Scenario: The registry lists exec only when configured
    Given an exec runner that returns "ok ran: {command}"
    Then the registry exposes the tools "view, grep, find, done, exec"

  Scenario: The schema exposes read-only tool specs
    Then the schema contains a function "view" requiring "file"
    And the schema contains a function "grep" requiring "pattern"
    And the schema contains a function "done" requiring "label"
    And the schema contains no function "exec"

  Scenario: The schema exposes exec when configured
    Given an exec runner that returns "ok ran: {command}"
    Then the schema contains a function "exec" requiring "command"

  Scenario: Grep skips files that cannot be read
    Given a file "src/locked.java" that cannot be read
    When the grep tool runs with pattern "int"
    Then the tool output contains "/repo/src/App.java:2: int f() {"
    And the tool output does not contain "locked.java"

  Scenario: Find matches single-character wildcards
    When the find tool runs with pattern "src/A?p.java"
    Then the tool output contains "/repo/src/App.java"
    And the tool output does not contain "/repo/src/Util.java"

  Scenario: The glob helper spans directories with double-star
    When the glob helper matches "src/**/*.java" against "src/x/y/App.java"
    Then the glob result is "true"

  Scenario: The glob helper rejects extension mismatch
    When the glob helper matches "src/**/*.java" against "src/App.txt"
    Then the glob result is "false"

  Scenario Outline: Source path guard allows only source extensions
    When the source path guard checks "<path>"
    Then the guard verdict is "<allowed>"

    Examples:
      | path               | allowed |
      | src/App.java       | true    |
      | app.py             | true    |
      | config.properties  | true    |
      | pkg/File.scala     | true    |
      | src/readme.md      | true    |
      | binary.so          | false   |
      | data/notebook.ipynb | false  |
