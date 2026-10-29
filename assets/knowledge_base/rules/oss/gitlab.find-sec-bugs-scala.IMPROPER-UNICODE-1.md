---
name: oss/gitlab.find-sec-bugs-scala.IMPROPER-UNICODE-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** Improper Handling of Unicode Encoding

**Why.** Reported as CWE-176. Ported from opengrep rule `gitlab.find_sec_bugs_scala.IMPROPER_UNICODE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.IMPROPER_UNICODE-1` (metavariables start with `$`):

- `$S = ($INPUT: String).$TRANSFORM(...);
...
$S.$METHOD(...);`
- `($INPUT: String).$TRANSFORM().$METHOD(...);`
- `(equals|equalsIgnoreCase|indexOf)`
- `(toLowerCase|toUpperCase)`
- `java.text.Normalizer.normalize(...);`
- `java.net.IDN.toASCII(...);`
- `($U: URI).toASCIIString()`
