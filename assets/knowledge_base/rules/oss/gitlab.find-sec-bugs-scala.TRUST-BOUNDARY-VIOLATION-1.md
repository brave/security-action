---
name: oss/gitlab.find-sec-bugs-scala.TRUST-BOUNDARY-VIOLATION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-501]
---

**Rule.** A trust boundary can be thought of as line drawn through a program. On one side of the line, data is untrusted. On the other side of the line, data is assumed to be trustworthy. The purpose of validation logic is to allow data to safely cross the trust boundary - to move from untrusted to trusted. A trust boundary violation occurs when a program blurs the line between what is trusted and what is untrusted. By combining trusted and untrusted data in the same data structure, it becomes easier for programmers to mistakenly trust unvalidated data.

**Why.** Reported as CWE-501. Ported from opengrep rule `gitlab.find_sec_bugs_scala.TRUST_BOUNDARY_VIOLATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($H: HttpServletRequest). ... .setAttribute($ARG1, $ARG2)
($H: HttpServletRequest). ... .putValue($ARG1, $ARG2)
```

Good:

```text
($H: HttpServletRequest). ... .setAttribute("...", "...")
($H: HttpServletRequest). ... .putValue("...", "...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.TRUST_BOUNDARY_VIOLATION-1` (metavariables start with `$`):

- `($H: HttpServletRequest). ... .setAttribute($ARG1, $ARG2)`
- `($H: HttpServletRequest). ... .setAttribute("...", "...")`
- `($H: HttpServletRequest). ... .putValue($ARG1, $ARG2)`
- `($H: HttpServletRequest). ... .putValue("...", "...")`
