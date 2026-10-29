---
name: oss/gitlab.find-sec-bugs-scala.SCRIPT-ENGINE-INJECTION-2
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The software constructs all or part of a code segment using externally-influenced input from an upstream component, but it does not neutralize or incorrectly neutralizes special elements that could modify the syntax or behavior of the intended code segment.

**Why.** Reported as CWE-94. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SCRIPT_ENGINE_INJECTION-2` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($P: org.springframework.expression.spel.standard.SpelExpressionParser).parseExpression($ARG);
```

Good:

```text
($P: org.springframework.expression.spel.standard.SpelExpressionParser ).parseExpression("...");
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SCRIPT_ENGINE_INJECTION-2` (metavariables start with `$`):

- `($P: org.springframework.expression.spel.standard.SpelExpressionParser).parseExpression($ARG);`
- `($P: org.springframework.expression.spel.standard.SpelExpressionParser ).parseExpression("...");`
