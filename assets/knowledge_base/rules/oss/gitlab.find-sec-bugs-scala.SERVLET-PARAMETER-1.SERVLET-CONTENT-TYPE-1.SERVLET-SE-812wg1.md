---
name: oss/gitlab.find-sec-bugs-scala.SERVLET-PARAMETER-1.SERVLET-CONTENT-TYPE-1.SERVLET-SE-812wg1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-20]
---

**Rule.** The Servlet can read GET and POST parameters from various methods. The value obtained should be considered unsafe."

**Why.** Reported as CWE-20. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SERVLET_PARAMETER-1.SERVLET_CONTENT_TYPE-1.SERVLET_SERVER_NAME-1.SERVLET_SESSION_ID-1.SERVLET_QUERY_STRING-1.SERVLET_HEADER-1.SERVLET_HEADER_REFERER-1.SERVLET_HEADER_USER_AGENT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: HttpServletRequest).getContentType
($REQ: HttpServletRequest).getServerName
($REQ: HttpServletRequest).getRequestedSessionId
($REQ: HttpServletRequest).getParameterValues(...)
($REQ: HttpServletRequest).getParameterMap
($REQ: HttpServletRequest).getParameterNames
($REQ: HttpServletRequest).getParameter(...)
$SESS.getAttribute("...")
($REQ: HttpServletRequest).getSession.getAttribute("...")
// flows to sink without sanitization
... + $PAR
... + $PAR + ...
$PAR + ...
$PAR
```

Good:

```text
Encode.forHtml(...)
org.owasp.esapi.Encoder.encodeForSQL(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SERVLET_PARAMETER-1.SERVLET_CONTENT_TYPE-1.SERVLET_SERVER_NAME-1.SERVLET_SESSION_ID-1.SERVLET_QUERY_STRING-1.SERVLET_HEADER-1.SERVLET_HEADER_REFERER-1.SERVLET_HEADER_USER_AGENT-1` (metavariables start with `$`):

- `Encode.forHtml(...)`
- `org.owasp.esapi.Encoder.encodeForSQL(...)`
- `... + $PAR`
- `... + $PAR + ...`
- `$PAR + ...`
- `$PAR`
- `($REQ: HttpServletRequest).getContentType`
- `($REQ: HttpServletRequest).getServerName`
- `($REQ: HttpServletRequest).getRequestedSessionId`
- `($REQ: HttpServletRequest).getParameterValues(...)`
- `($REQ: HttpServletRequest).getParameterMap`
- `($REQ: HttpServletRequest).getParameterNames`
- `($REQ: HttpServletRequest).getParameter(...)`
- `($REQ: HttpServletRequest).getSession`
- `$SESS.getAttribute("...")`
- `($REQ: HttpServletRequest).getSession.getAttribute("...")`
