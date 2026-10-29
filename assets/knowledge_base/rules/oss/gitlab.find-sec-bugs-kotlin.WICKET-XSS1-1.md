---
name: oss/gitlab.find-sec-bugs-kotlin.WICKET-XSS1-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** Disabling HTML escaping put the application at risk for Cross-Site Scripting (XSS).

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.WICKET_XSS1-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$OBJ.setEscapeModelStrings(false);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.WICKET_XSS1-1` (metavariables start with `$`):

- `import org.apache.wicket.$A
...`
- `$OBJ.setEscapeModelStrings(false);`
