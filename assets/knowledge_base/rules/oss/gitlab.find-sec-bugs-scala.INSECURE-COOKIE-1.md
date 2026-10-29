---
name: oss/gitlab.find-sec-bugs-scala.INSECURE-COOKIE-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-539]
---

**Rule.** "A new cookie is created without the Secure flag set. The Secure flag is a directive to the browser to make sure that the cookie is not sent for insecure communication (http://)"

**Why.** Reported as CWE-539. Ported from opengrep rule `gitlab.find_sec_bugs_scala.INSECURE_COOKIE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
val $C = new javax.servlet.http.Cookie(..., ...);
...
$RESP.addCookie($C);
($C:javax.servlet.http.Cookie).setSecure(false);
```

Good:

```text
val $C = new javax.servlet.http.Cookie(..., ...);
...
$C.setSecure(true);
...
$RESP.addCookie($C);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.INSECURE_COOKIE-1` (metavariables start with `$`):

- `val $C = new javax.servlet.http.Cookie(..., ...);
...
$C.setSecure(true);
...
$RESP.addCookie($C);`
- `val $C = new javax.servlet.http.Cookie(..., ...);
...
$RESP.addCookie($C);`
- `($C:javax.servlet.http.Cookie).setSecure(false);`
