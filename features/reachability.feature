Feature: Reachability evidence for triage agents
  As the agentic FP triage harness
  I want a reachability tool backed by scanner rule modes and a text call graph
  So the agent gets cross-file reachability evidence without manual grep rounds

  Background:
    Given a repo root "repo"
    And a file system with:
      | path               | content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
      | repo/src/A.java    | package org.test;\npublic class A {\n  public void helper(String req) {\n    sink(req);\n  }\n  private void orphan() {\n    dead();\n  }\n}                                                                                                                                                                                                                                                                                                                                                                                                                      |
      | repo/src/B.java    | package org.test;\npublic class B {\n  protected void doGet(HttpServletRequest req, HttpServletResponse res) {\n    new A().helper(req.getParameter("q"));\n  }\n}                                                                                                                                                                                                                                                                                                                                                                                               |
      | repo/src/C.java    | package org.test;\npublic class C {\n  void run() {\n    orphanish();\n  }\n}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

  Scenario: Enclosing function is found for a line inside a method
    When the enclosing function of "repo/src/B.java" line 4 is computed
    Then the enclosing function name is "doGet"
    And the enclosing function starts at line 3

  Scenario: Enclosing function is null outside any method
    When the enclosing function of "repo/src/A.java" line 1 is computed
    Then no enclosing function is found

  Scenario: Callers list excludes the definition site
    When the callers of "helper" are computed
    Then the caller list size is 1
    And the caller list contains "repo/src/B.java"

  Scenario: Sink directly inside an entry point is reachable
    When reachability of "repo/src/B.java" line 4 function "doGet" is computed
    Then the reachability verdict is "reachable"
    And the reachability chain is "doGet"

  Scenario: Helper called from an entry point is reachable at depth 1
    When reachability of "repo/src/A.java" line 3 function "helper" is computed
    Then the reachability verdict is "reachable"
    And the reachability chain is "doGet <- helper"

  Scenario: Uncalled function is unreachable
    When reachability of "repo/src/A.java" line 6 function "orphan" is computed
    Then the reachability verdict is "unreachable"

  Scenario: Reach tool composes rule, callers and reachability evidence
    Given the reach tool is configured
    When the reach tool runs with file "repo/src/A.java" line 4 and rule "java-ssrf"
    Then the tool output contains "rule java-ssrf: scanner unknown"
    And the tool output contains "enclosing function helper (repo/src/A.java:3)"
    And the tool output contains "reachable from entry doGet: yes (doGet <- helper)"

  Scenario: Reach tool reports rules without scanner taint confirmation
    Given the reach tool is configured
    When the reach tool runs with file "repo/src/B.java" line 4 and rule "unknown-rule"
    Then the tool output contains "rule unknown-rule: scanner unknown"

  Scenario: Reach tool reports opengrep taint mode for scanner-confirmed rules
    Given the reach tool is configured with opengrep rule modes
    When the reach tool runs with file "repo/src/A.java" line 4 and rule "x-ssti"
    Then the tool output contains "rule x-ssti: scanner taint (source->sink confirmed by scanner)"

  Scenario: Opengrep rule modes are loaded from rule YAML files
    Given an opengrep rules directory with taint and search rules
    When the opengrep rule modes are loaded
    Then rule "x-ssti" has scanner mode "taint"
    And rule "x-noop" has scanner mode "search"

  Scenario: Real opengrep rules from this repository load with taint modes
    Given the repository's opengrep rules are loaded
    Then rule "go-ssti" has scanner mode "taint"
    And rule "sveltekit-event-fetch-path-traversal" has scanner mode "taint"
    And at least 60 taint rules are loaded

  Scenario: Reach tool reports scanner taint for a real opengrep rule
    Given the repository's opengrep rules are loaded
    And the reach tool is configured with the loaded scanner modes
    When the reach tool runs with file "repo/src/A.java" line 4 and rule "go-ssti"
    Then the tool output contains "rule go-ssti: scanner taint (source->sink confirmed by scanner)"
    And the tool output contains "enclosing function helper (repo/src/A.java:3)"
    And the tool output contains "reachable from entry doGet: yes (doGet <- helper)"

  Scenario: Registry exposes the reach tool when configured
    Given a tool registry with reach enabled
    Then the registry exposes the tools "view, grep, find, done, reach"
