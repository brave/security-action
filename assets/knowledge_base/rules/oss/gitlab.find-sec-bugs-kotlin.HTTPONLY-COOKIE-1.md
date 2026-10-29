---
name: oss/gitlab.find-sec-bugs-kotlin.HTTPONLY-COOKIE-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** A new cookie is created without the HttpOnly flag set. The HttpOnly flag is a directive to the browser to make sure that the cookie can not be red by malicious script. When a user is the target of a "Cross-Site Scripting", the attacker would benefit greatly from getting the session id for example.

**Why.** Reported as CWE-1004. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.HTTPONLY_COOKIE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$C = $X.servlet.http.Cookie(..., ...)
...;
($RESP: $X.servlet.http.HttpServletResponse).addCookie($C)
```

Good:

```text
$C = $X.servlet.http.Cookie(..., ...)
...
$C.setHttpOnly(true)
...;
($RESP: $X.servlet.http.HttpServletResponse).addCookie($C)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.HTTPONLY_COOKIE-1` (metavariables start with `$`):

- `$C = $X.servlet.http.Cookie(..., ...)
...;
($RESP: $X.servlet.http.HttpServletResponse).addCookie($C)`
- `$C = $X.servlet.http.Cookie(..., ...)
...
$C.setHttpOnly(true)
...;
($RESP: $X.servlet.http.HttpServletResponse).addCookie($C)`
