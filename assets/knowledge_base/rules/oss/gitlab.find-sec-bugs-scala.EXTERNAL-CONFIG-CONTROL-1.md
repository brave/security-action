---
name: oss/gitlab.find-sec-bugs-scala.EXTERNAL-CONFIG-CONTROL-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-15]
---

**Rule.** Allowing external control of system settings can disrupt service or cause an application to behave in unexpected, and potentially malicious ways. An attacker could cause an error by providing a nonexistent catalog name or connect to an unauthorized portion of the database.

**Why.** Reported as CWE-15. Ported from opengrep rule `gitlab.find_sec_bugs_scala.EXTERNAL_CONFIG_CONTROL-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$TAINTED = ($REQ: HttpServletRequest).getParameter(...);
...
($CONN: java.sql.Connection).setCatalog($TAINTED);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.EXTERNAL_CONFIG_CONTROL-1` (metavariables start with `$`):

- `$TAINTED = ($REQ: HttpServletRequest).getParameter(...);
...
($CONN: java.sql.Connection).setCatalog($TAINTED);`
