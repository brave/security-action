---
name: oss/gitlab.find-sec-bugs-scala.HTTPONLY-COOKIE-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-1004]
---

**Rule.** A new cookie is created without the HttpOnly flag set. The HttpOnly flag is a directive to the browser to make sure that the cookie can not be red by malicious script. When a user is the target of a "Cross-Site Scripting", the attacker would benefit greatly from getting the session id for example.

**Why.** Reported as CWE-1004. Ported from opengrep rule `gitlab.find_sec_bugs_scala.HTTPONLY_COOKIE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.HTTPONLY_COOKIE-1` (metavariables start with `$`):

- `val $C = new javax.servlet.http.Cookie(..., ...);
...
$RESP.addCookie($C);`
- `val $C = new javax.servlet.http.Cookie(..., ...);
...
$C.setHttpOnly(true);
...
$RESP.addCookie($C);`
- `(javax.servlet.http.Cookie $C).setHttpOnly(false);`
