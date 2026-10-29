---
name: oss/gitlab.find-sec-bugs.EXTERNAL-CONFIG-CONTROL-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application was found using user-supplied input in a `java.sql.Connection`'s `setCatalog` call. This could allow an adversary to supply a different database for the lifetime of the connection. Allowing external control of system settings can disrupt service or cause an application to behave in unexpected, and potentially malicious ways. Most likely this would only cause an error by providing a nonexistent catalog name. It is recommended to not use user-supplied input when selecting the database for an applications database connection.

**Why.** Reported as CWE-15. Ported from opengrep rule `gitlab.find_sec_bugs.EXTERNAL_CONFIG_CONTROL-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
(java.sql.Connection $CONN).setCatalog($TAINTED);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.EXTERNAL_CONFIG_CONTROL-1` (metavariables start with `$`):

- `$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
(java.sql.Connection $CONN).setCatalog($TAINTED);`
