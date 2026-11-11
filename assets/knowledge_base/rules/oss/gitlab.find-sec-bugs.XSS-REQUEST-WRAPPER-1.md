---
name: oss/gitlab.find-sec-bugs.XSS-REQUEST-WRAPPER-1
rubric: safety
severity: nit
languages: [java]
cwe: [CWE-79]
---

**Rule.** Avoid using custom XSS filtering. Please use standard sanitization functions.

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.find_sec_bugs.XSS_REQUEST_WRAPPER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
stripXSS(...) { ... }
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XSS_REQUEST_WRAPPER-1` (metavariables start with `$`):

- `class $CLASS extends HttpServletRequestWrapper {
...
}`
- `stripXSS(...) { ... }`
