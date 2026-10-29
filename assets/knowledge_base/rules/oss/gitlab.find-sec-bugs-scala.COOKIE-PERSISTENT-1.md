---
name: oss/gitlab.find-sec-bugs-scala.COOKIE-PERSISTENT-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-614]
---

**Rule.** "Storing sensitive data in a persistent cookie for an extended period can lead to a breach of confidentiality or account compromise."

**Why.** Reported as CWE-614. Ported from opengrep rule `gitlab.find_sec_bugs_scala.COOKIE_PERSISTENT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($C: Cookie).setMaxAge($AGE)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.COOKIE_PERSISTENT-1` (metavariables start with `$`):

- `($C: Cookie).setMaxAge($AGE)`
