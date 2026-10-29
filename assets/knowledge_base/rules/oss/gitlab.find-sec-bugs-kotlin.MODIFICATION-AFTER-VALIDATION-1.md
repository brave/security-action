---
name: oss/gitlab.find-sec-bugs-kotlin.MODIFICATION-AFTER-VALIDATION-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** CERT: IDS11-J. Perform any string modifications before validation

**Why.** Reported as CWE-182. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.MODIFICATION_AFTER_VALIDATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$VAR + $OTHER
$VAR.$METHOD(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.MODIFICATION_AFTER_VALIDATION-1` (metavariables start with `$`):

- `$PATTERN = Pattern.compile(...)
...`
- `$PATTERN.matcher($VAR)
...`
- `$VAR + $OTHER`
- `$VAR.$METHOD(...)`
- `(replace|replaceAll|replaceFirst|concat)`
