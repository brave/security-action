---
name: oss/gitlab.find-sec-bugs.COOKIE-PERSISTENT-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** Storing sensitive data in a persistent cookie for an extended period can lead to a breach of confidentiality or account compromise.

**Why.** Reported as CWE-614. Ported from opengrep rule `gitlab.find_sec_bugs.COOKIE_PERSISTENT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.COOKIE_PERSISTENT-1` (metavariables start with `$`):

- `(javax.servlet.http.Cookie $C).setMaxAge($AGE);`
