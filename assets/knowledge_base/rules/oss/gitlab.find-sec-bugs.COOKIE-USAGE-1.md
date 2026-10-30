---
name: oss/gitlab.find-sec-bugs.COOKIE-USAGE-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-614]
---

**Rule.** The information stored in a custom cookie should not be sensitive or related to the session. In most cases, sensitive data should only be stored in session and referenced by the user's session cookie.

**Why.** Reported as CWE-614. Ported from opengrep rule `gitlab.find_sec_bugs.COOKIE_USAGE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$C.getName();
$C.getValue();
$C.getPath();
(Cookie $COOKIE).getName();
(Cookie $COOKIE).getValue();
(Cookie $COOKIE).getPath();
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.COOKIE_USAGE-1` (metavariables start with `$`):

- `$FUNC(..., HttpServletRequest $REQ, ...) {
  ...
}`
- `for (Cookie $C : $REQ.getCookies()) {
    ...
}`
- `$C.getName();`
- `$C.getValue();`
- `$C.getPath();`
- `(Cookie $COOKIE).getName();`
- `(Cookie $COOKIE).getValue();`
- `(Cookie $COOKIE).getPath();`
