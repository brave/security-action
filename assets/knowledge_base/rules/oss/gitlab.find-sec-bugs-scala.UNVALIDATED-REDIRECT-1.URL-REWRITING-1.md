---
name: oss/gitlab.find-sec-bugs-scala.UNVALIDATED-REDIRECT-1.URL-REWRITING-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-601]
---

**Rule.** Unvalidated redirects occur when an application redirects a user to a destination URL specified by a user supplied parameter that is not validated. Such vulnerabilities can be used to facilitate phishing attacks.

**Why.** Reported as CWE-601. Ported from opengrep rule `gitlab.find_sec_bugs_scala.UNVALIDATED_REDIRECT-1.URL_REWRITING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($REQ: HttpServletResponse).sendRedirect(...)
($REQ: HttpServletResponse).addHeader(...)
($REQ: HttpServletResponse).encodeURL(...)
($REQ: HttpServletResponse).encodeRedirectUrl(...)
```

Good:

```text
($REQ: HttpServletResponse).sendRedirect("...")
($REQ: HttpServletResponse).addHeader("...", "...")
($REQ: HttpServletResponse).encodeURL("...")
($REQ: HttpServletResponse).encodeRedirectUrl("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.UNVALIDATED_REDIRECT-1.URL_REWRITING-1` (metavariables start with `$`):

- `($REQ: HttpServletResponse).sendRedirect(...)`
- `($REQ: HttpServletResponse).sendRedirect("...")`
- `($REQ: HttpServletResponse).addHeader(...)`
- `($REQ: HttpServletResponse).addHeader("...", "...")`
- `($REQ: HttpServletResponse).encodeURL(...)`
- `($REQ: HttpServletResponse).encodeURL("...")`
- `($REQ: HttpServletResponse).encodeRedirectUrl(...)`
- `($REQ: HttpServletResponse).encodeRedirectUrl("...")`
