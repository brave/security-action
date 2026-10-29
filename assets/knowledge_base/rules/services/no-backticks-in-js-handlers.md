---
name: services/no-backticks-in-js-handlers
rubric: safety
severity: should_fix
languages: [generic]
cwe: [CWE-79]
---

**Rule.** Backtick in JS handler may cause XSS since they are typically not auto-escaped in variables. Consider using single or double quotes instead of backticks.

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). Ported from opengrep rule `no-backticks-in-js-handlers` (services/no-backticks-in-js-handlers.yaml).

## Examples

Bad:

```text
`{{[^}]+}}`
```

## Detection hints

Literal patterns from opengrep rule `no-backticks-in-js-handlers` (metavariables start with `$`):

- `$HANDLER="..."`
- `$HANDLER='...'`
- `$HANDLER=...`
- ``{{[^}]+}}``
- `(?i)on[a-z]{3,40}`
