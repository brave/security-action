---
name: oss/gitlab.find-sec-bugs-scala.COOKIE-USAGE-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The information stored in a custom cookie should not be sensitive or related to the session. In most cases, sensitive data should only be stored in session and referenced by the user's session cookie.

**Why.** Reported as CWE-614. Ported from opengrep rule `gitlab.find_sec_bugs_scala.COOKIE_USAGE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$C.getName
$C.getValue
$C.getPath
($C: Cookie).getName()
($C: Cookie).getValue
($C: Cookie).getPath
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.COOKIE_USAGE-1` (metavariables start with `$`):

- `def $FUNC(..., $REQ: HttpServletRequest, ...): $TYPE = {
  ...
}`
- `for ($C <- $REQ.getCookies) {
    ...
}`
- `$C.getName`
- `$C.getValue`
- `$C.getPath`
- `($C: Cookie).getName()`
- `($C: Cookie).getValue`
- `($C: Cookie).getPath`
