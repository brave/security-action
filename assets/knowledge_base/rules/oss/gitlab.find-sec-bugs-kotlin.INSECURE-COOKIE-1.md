---
name: oss/gitlab.find-sec-bugs-kotlin.INSECURE-COOKIE-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-614]
---

**Rule.** "A new cookie is created without the Secure flag set. The Secure flag is a directive to the browser to make sure that the cookie is not sent for insecure communication (http://)"

**Why.** Reported as CWE-614. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.INSECURE_COOKIE-1` (generated/oss/audit.yaml).

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
$C.setSecure(true)
...;
($RESP: $X.servlet.http.HttpServletResponse).addCookie($C)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.INSECURE_COOKIE-1` (metavariables start with `$`):

- `$C = $X.servlet.http.Cookie(..., ...)
...;
($RESP: $X.servlet.http.HttpServletResponse).addCookie($C)`
- `$C = $X.servlet.http.Cookie(..., ...)
...
$C.setSecure(true)
...;
($RESP: $X.servlet.http.HttpServletResponse).addCookie($C)`
