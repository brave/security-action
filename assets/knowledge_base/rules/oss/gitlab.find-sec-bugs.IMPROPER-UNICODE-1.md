---
name: oss/gitlab.find-sec-bugs.IMPROPER-UNICODE-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-176]
---

**Rule.** Improper Handling of Unicode Encoding

**Why.** Reported as CWE-176. Ported from opengrep rule `gitlab.find_sec_bugs.IMPROPER_UNICODE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.IMPROPER_UNICODE-1` (metavariables start with `$`):

- `$S = (String $INPUT).$TRANSFORM(...);
...
$S.$METHOD(...);`
- `(String $INPUT).$TRANSFORM().$METHOD(...);`
- `(equals|equalsIgnoreCase|indexOf)`
- `(toLowerCase|toUpperCase)`
- `java.text.Normalizer.normalize(...);`
- `java.net.IDN.toASCII(...);`
- `(URI $U).toASCIIString();`
