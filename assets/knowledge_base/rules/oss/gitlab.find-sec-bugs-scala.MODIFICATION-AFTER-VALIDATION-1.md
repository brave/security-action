---
name: oss/gitlab.find-sec-bugs-scala.MODIFICATION-AFTER-VALIDATION-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** CERT: IDS11-J. Perform any string modifications before validation

**Why.** Reported as CWE-182. Ported from opengrep rule `gitlab.find_sec_bugs_scala.MODIFICATION_AFTER_VALIDATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$Y.matcher($VAR);
...
$VAR.$METHOD(...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.MODIFICATION_AFTER_VALIDATION-1` (metavariables start with `$`):

- `$Y.matcher($VAR);
...
$VAR.$METHOD(...);`
- `(replace)`
