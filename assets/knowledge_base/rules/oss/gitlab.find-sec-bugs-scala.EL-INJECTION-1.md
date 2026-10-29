---
name: oss/gitlab.find-sec-bugs-scala.EL-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** An expression is built with a dynamic value. The source of the value(s) should be verified to avoid that unfiltered values fall into this risky code evaluation.

**Why.** Reported as CWE-94. Ported from opengrep rule `gitlab.find_sec_bugs_scala.EL_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$X.createValueExpression(..., $EXPR, ...)
$X.createMethodExpression(..., $EXPR, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.EL_INJECTION-1` (metavariables start with `$`):

- `import javax.el._
...`
- `def $FUNC(..., $EXPR: String, ...) : $TYPE = {
  ...
}`
- `def $FUNC(..., $EXPR: String, ...) = {
  ...
}`
- `$X.createValueExpression(..., $EXPR, ...)`
- `$X.createMethodExpression(..., $EXPR, ...)`
