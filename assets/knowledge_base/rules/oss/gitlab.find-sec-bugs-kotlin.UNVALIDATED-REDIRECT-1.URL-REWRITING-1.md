---
name: oss/gitlab.find-sec-bugs-kotlin.UNVALIDATED-REDIRECT-1.URL-REWRITING-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** Unvalidated redirects occur when an application redirects a user to a destination URL specified by a user supplied parameter that is not validated. Such vulnerabilities can be used to facilitate phishing attacks.

**Why.** Reported as CWE-601. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.UNVALIDATED_REDIRECT-1.URL_REWRITING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$URL = ($REQ: $X.servlet.http.HttpServletRequest).$M(...);
// flows to sink without sanitization
($RES: $X.servlet.http.HttpServletResponse).sendRedirect($URL)
($RES: $X.servlet.http.HttpServletResponse).addHeader("Location", $URL)
```

Good:

```text
($RES: $X.servlet.http.HttpServletResponse).sendRedirect($URL)
($RES: $X.servlet.http.HttpServletResponse).addHeader("Location", $URL)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.UNVALIDATED_REDIRECT-1.URL_REWRITING-1` (metavariables start with `$`):

- `$URL = ($REQ: $X.servlet.http.HttpServletRequest).$M(...);`
- `(getParameter|getCookies|getHeader|getHeaders|getHeaderNames|getPathInfo|getPathTranslated|getContextPath|getQueryString|getRemoteUser|getRequestedSessionId|getRequestURI|getRequestURL|getServletPath|getParts|getPart|getReader)`
- `($RES: $X.servlet.http.HttpServletResponse).sendRedirect($URL)`
- `($RES: $X.servlet.http.HttpServletResponse).addHeader("Location", $URL)`
- `if ($SAFE.contains($URL)){
  ...
}`
