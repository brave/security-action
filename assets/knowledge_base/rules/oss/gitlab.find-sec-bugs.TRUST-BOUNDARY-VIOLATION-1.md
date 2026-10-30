---
name: oss/gitlab.find-sec-bugs.TRUST-BOUNDARY-VIOLATION-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-501]
---

**Rule.** A trust boundary can be thought of as line drawn through a program. On one side of the line, data is untrusted. On the other side of the line, data is assumed to be trustworthy. The purpose of validation logic is to allow data to safely cross the trust boundary - to move from untrusted to trusted. A trust boundary violation occurs when a program blurs the line between what is trusted and what is untrusted. By combining trusted and untrusted data in the same data structure, it becomes easier for programmers to mistakenly trust unvalidated data.

**Why.** Reported as CWE-501. Ported from opengrep rule `gitlab.find_sec_bugs.TRUST_BOUNDARY_VIOLATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
(HttpServletRequest $H). ... .setAttribute($ARG1, $ARG2);
(HttpServletRequest $H). ... .putValue($ARG1, $ARG2);
```

Good:

```java
(HttpServletRequest $H). ... .setAttribute("...", "...");
(HttpServletRequest $H). ... .putValue("...", "...");
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.TRUST_BOUNDARY_VIOLATION-1` (metavariables start with `$`):

- `(HttpServletRequest $H). ... .setAttribute($ARG1, $ARG2);`
- `(HttpServletRequest $H). ... .setAttribute("...", "...");`
- `(HttpServletRequest $H). ... .putValue($ARG1, $ARG2);`
- `(HttpServletRequest $H). ... .putValue("...", "...");`
