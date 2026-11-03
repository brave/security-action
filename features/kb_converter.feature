Feature: Opengrep to chromium knowledge-base converter
  As the security-action maintainer
  I want our opengrep rules ported to the chromium agents knowledge-base markdown format
  So LLM findings generation can consume structured rubrics instead of raw YAML

  Scenario: Converts a simple security pattern rule
    Given an opengrep rule "test-ssti" from "services/test.yaml" with:
      """
      rules:
        - id: test-ssti
          message: Server-side template injection allows remote code execution. Escape user input before templating.
          severity: ERROR
          languages: [go]
          metadata:
            category: security
            cwe:
              - "CWE-1336: Template Injection"
            source: https://github.com/brave/security-action/blob/main/assets/opengrep_rules/services/test.yaml
          patterns:
            - pattern-either:
                - pattern: template.New($X).Parse($USER)
            - pattern-not: template.New($X).Parse(template.HTMLEscapeString($USER))
      """
    When the rule is converted
    Then the markdown frontmatter has name "services/test-ssti" rubric "safety" severity "should_fix" and languages "go"
    And the markdown frontmatter has cwe "CWE-1336"
    And the Rule section quotes the message "Server-side template injection allows remote code execution."
    And the Why section mentions "CWE-1336"
    And the Examples section has a Bad block with "template.New($X).Parse($USER)"
    And the Examples section has a Good block with "HTMLEscapeString"
    And the Detection hints section contains the literal pattern "template.New($X).Parse($USER)"

  Scenario: Maps severity and rubric for non-error and non-security rules
    Given an opengrep rule "api-scan" from "client/scan.yaml" with:
      """
      rules:
        - id: api-scan
          message: Interesting API call detected
          severity: INFO
          languages: [cpp]
          metadata:
            category: correctness
          patterns:
            - pattern: std::next(...)
      """
    When the rule is converted
    Then the markdown frontmatter has name "client/api-scan" rubric "correctness" severity "nit" and languages "cpp"

  Scenario: Emits taint rule examples with sanitizers as good
    Given an opengrep rule "taint-flow" from "services/flow.yaml" with:
      """
      rules:
        - id: taint-flow
          message: Untrusted input reaches the sink unescaped
          severity: WARNING
          languages: [js]
          metadata:
            category: security
            cwe:
              - "CWE-79: XSS"
          mode: taint
          pattern-sources:
            - patterns:
                - pattern: $REQ.query[$K]
          pattern-sanitizers:
            - patterns:
                - pattern: encodeURIComponent(...)
          pattern-sinks:
            - pattern: render($SINK)
      """
    When the rule is converted
    Then the markdown frontmatter has name "services/taint-flow" rubric "safety" severity "should_fix" and languages "js"
    And the Examples section has a Bad block with "$REQ.query[$K]"
    And the Examples section has a Bad block with "render($SINK)"
    And the Examples section has a Good block with "encodeURIComponent"

  Scenario: Writes COMMON_METADATA with path expressions grouped by include globs
    Given opengrep rules from "services/group.yaml":
      """
      rules:
        - id: scoped-rule
          message: Scoped finding
          severity: ERROR
          languages: [cpp]
          paths:
            include:
              - "*.server.ts"
          metadata:
            category: security
          patterns:
            - pattern: bad_call(...)
        - id: free-rule
          message: Unscoped finding
          severity: WARNING
          languages: [go]
          metadata:
            category: security
          patterns:
            - pattern: other_call(...)
      """
    When the ruleset is converted to a knowledge-base tree
    Then the COMMON_METADATA for "services" has path expression ".*\.server\.ts" listing rule "services/scoped-rule"
    And the COMMON_METADATA for "services" has a catch-all path expression ".*" listing rule "services/free-rule"

  Scenario: Converts the real ruleset
    Given the real opengrep ruleset with dirs "client,services,generated/oss"
    When the ruleset is converted to a knowledge-base tree
    Then every rule yields a markdown file with a non-empty Rule section
    And every kb dir has a COMMON_METADATA file