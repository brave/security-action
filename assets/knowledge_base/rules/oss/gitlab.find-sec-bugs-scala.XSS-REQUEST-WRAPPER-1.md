---
name: oss/gitlab.find-sec-bugs-scala.XSS-REQUEST-WRAPPER-1
rubric: safety
severity: nit
languages: [scala]
cwe: [CWE-79]
---

**Rule.** Avoid using custom XSS filtering. Please use standard sanitization functions.

**Why.** Reported as CWE-79. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XSS_REQUEST_WRAPPER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
def stripXSS(...) = { ... }
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XSS_REQUEST_WRAPPER-1` (metavariables start with `$`):

- `class $CLASS(...) extends HttpServletRequestWrapper(...) {
...
}`
- `def stripXSS(...) = { ... }`
