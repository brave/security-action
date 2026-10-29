---
name: oss/gitlab.find-sec-bugs-scala.WICKET-XSS1-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-79]
---

**Rule.** Disabling HTML escaping put the application at risk for Cross-Site Scripting (XSS).

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.find_sec_bugs_scala.WICKET_XSS1-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($X: Label).setEscapeModelStrings(false);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.WICKET_XSS1-1` (metavariables start with `$`):

- `($X: Label).setEscapeModelStrings(false);`
