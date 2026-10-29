---
name: oss/gitlab.find-sec-bugs-kotlin.EL-INJECTION-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** An expression is built with a dynamic value. The source of the value(s) should be verified to avoid that unfiltered values fall into this risky code evaluation.

**Why.** Reported as CWE-917. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.EL_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.EL_INJECTION-1` (metavariables start with `$`):

- `^create(Method|Value)Expression$`
- `"..."`
- `($EXP: ExpressionFactory ).$METHOD(($CTX: $X.el.ELContext), $EXPR, ...)`
- `($P: $X.el.ELProcessor).$METHOD(...)`
- `($P: $X.el.ELProcessor).$METHOD("...", ...)`
- `^(eval|(get|set)Value)$`
