---
name: oss/gitlab.find-sec-bugs-scala.NORMALIZATION-AFTER-VALIDATION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-182]
---

**Rule.** IDS01-J. Normalize strings before validating them

**Why.** Reported as CWE-182. Ported from opengrep rule `gitlab.find_sec_bugs_scala.NORMALIZATION_AFTER_VALIDATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$Y = java.util.regex.Pattern.compile("[<>]");
...
$Y.matcher($VAR);
...
java.text.Normalizer.normalize($VAR, ...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.NORMALIZATION_AFTER_VALIDATION-1` (metavariables start with `$`):

- `$Y = java.util.regex.Pattern.compile("[<>]");
...
$Y.matcher($VAR);
...
java.text.Normalizer.normalize($VAR, ...);`
