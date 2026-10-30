Feature: LLM findings generation from the knowledge-base
  As the security-action maintainer
  I want an LLM agent to generate findings driven by the ported knowledge-base rules
  So broad rules produce findings in the same enriched line format our post-filter consumes

  Scenario: Loads the knowledge-base rules with scoping metadata
    Given a knowledge-base tree with rules:
      """
      rules/services/go-ssti.md:
        ---
        name: services/go-ssti
        rubric: safety
        severity: should_fix
        languages: [go]
        cwe: [CWE-1336]
        ---

        **Rule.** Report template injection.

        ## Detection hints
      """
    And a COMMON_METADATA for "services" with:
      """
      agentic_review {
        capability_groups {
          path_expression: ".*"
          rules: "rules/services/go-ssti.md"
        }
      }
      """
    When the knowledge-base is loaded
    Then there is 1 rule named "services/go-ssti" with rubric "safety" cwe "CWE-1336" and 1 path expression

  Scenario: Scopes rules to changed files by path expression and language
    Given a knowledge-base tree with rules:
      """
      rules/services/go-rule.md:
        ---
        name: services/go-rule
        rubric: safety
        severity: should_fix
        languages: [go]
        ---

        **Rule.** Report bad go.
      """
    And a COMMON_METADATA for "services" with:
      """
      agentic_review {
        capability_groups {
          path_expression: ".*\.server\.ts"
          rules: "rules/services/go-rule.md"
        }
      }
      """
    When the knowledge-base is loaded
    And the rules are scoped to changed files "src/a.go, src/x.server.ts"
    Then the scoped rules are empty

  Scenario: Scoped rule matches on catch-all and language
    Given a knowledge-base tree with rules:
      """
      rules/services/go-rule.md:
        ---
        name: services/go-rule
        rubric: safety
        severity: should_fix
        languages: [go]
        ---

        **Rule.** Report bad go.
      """
    And a COMMON_METADATA for "services" with:
      """
      agentic_review {
        capability_groups {
          path_expression: ".*"
          rules: "rules/services/go-rule.md"
        }
      }
      """
    When the knowledge-base is loaded
    And the rules are scoped to changed files "src/a.go, src/x.ts"
    Then 1 scoped rule remains with files "src/a.go"

  Scenario: Generation agent emits findings as enriched log lines
    Given a knowledge-base tree with rules:
      """
      rules/services/go-rule.md:
        ---
        name: services/go-rule
        rubric: safety
        severity: should_fix
        languages: [go]
        cwe: [CWE-89]
        ---

        **Rule.** Report sql string concat.
      """
    When the knowledge-base is loaded
    And the rules are scoped to changed files "src/a.go"
    And a fake model client with script:
      | call | tool | arguments                                                                    |
      | 1    | view | {"path":"src/a.go"}                                                          |
      | 2    | done | {"findings":[{"file":"src/a.go","line":7,"message":"sql concat is dangerous","rule":"services/go-rule"}]} |
    When the generation agent runs for the scoped rules
    Then the run produces the log line "F:src/a.go:7 sql concat is dangerous <!-- Category: safety, CWE: CWE-89, Rule: services/go-rule -->"
    And the log line parses into a queue item with cwe 89 and rule "services/go-rule"

  Scenario: Agent reporting no violations yields no log lines
    Given a knowledge-base tree with rules:
      """
      rules/services/go-rule.md:
        ---
        name: services/go-rule
        rubric: safety
        severity: should_fix
        languages: [go]
        ---

        **Rule.** Report sql string concat.
      """
    When the knowledge-base is loaded
    And the rules are scoped to changed files "src/a.go"
    And a fake model client with script:
      | call | tool | arguments           |
      | 1    | done | {"findings":[]}     |
    When the generation agent runs for the scoped rules
    Then no log lines are produced and the run stopped with "done"

  Scenario: Malformed findings JSON is rejected and retried
    Given a knowledge-base tree with rules:
      """
      rules/services/go-rule.md:
        ---
        name: services/go-rule
        rubric: safety
        severity: should_fix
        languages: [go]
        ---

        **Rule.** Report sql string concat.
      """
    When the knowledge-base is loaded
    And the rules are scoped to changed files "src/a.go"
    And a fake model client with script:
      | call | tool | arguments               |
      | 1    | done | {"findings":"oops"}     |
      | 2    | done | {"findings":[]}         |
    When the generation agent runs for the scoped rules
    Then no log lines are produced and the run stopped with "done"
    And the model received a retry correction

  Scenario: The real knowledge-base loads with scoped rules
    Given the real knowledge-base at "assets/knowledge_base"
    When the knowledge-base is loaded
    And the rules are scoped to changed files "services/ssti.yaml, src/main.go, src/handler.py"
    Then at least 400 rules loaded and at least 10 scoped rules remain
