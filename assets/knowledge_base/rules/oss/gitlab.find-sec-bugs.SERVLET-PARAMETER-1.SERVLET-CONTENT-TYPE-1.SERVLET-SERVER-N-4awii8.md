---
name: oss/gitlab.find-sec-bugs.SERVLET-PARAMETER-1.SERVLET-CONTENT-TYPE-1.SERVLET-SERVER-N-4awii8
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-20]
---

**Rule.** The Servlet can read GET and POST parameters from various methods. The value obtained should be considered unsafe."

**Why.** Reported as CWE-20. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.SERVLET_PARAMETER-1.SERVLET_CONTENT_TYPE-1.SERVLET_SERVER_NAME-1.SERVLET_SESSION_ID-1.SERVLET_QUERY_STRING-1.SERVLET_HEADER-1.SERVLET_HEADER_REFERER-1.SERVLET_HEADER_USER_AGENT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(javax.servlet.http.HttpServletRequest $REQ).getContentType(...)
(javax.servlet.http.HttpServletRequest $REQ).getServerName(...)
(javax.servlet.http.HttpServletRequest $REQ).getRequestedSessionId(...)
(javax.servlet.http.HttpServletRequest $REQ).getParameterValues(...)
(javax.servlet.http.HttpServletRequest $REQ).getParameterMap(...)
(javax.servlet.http.HttpServletRequest $REQ).getParameterNames(...)
(javax.servlet.http.HttpServletRequest $REQ).getParameter(...)
// flows to sink without sanitization
"..." + $PAR
$PAR + "..."
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SERVLET_PARAMETER-1.SERVLET_CONTENT_TYPE-1.SERVLET_SERVER_NAME-1.SERVLET_SESSION_ID-1.SERVLET_QUERY_STRING-1.SERVLET_HEADER-1.SERVLET_HEADER_REFERER-1.SERVLET_HEADER_USER_AGENT-1` (metavariables start with `$`):

- `"..." + $PAR`
- `$PAR + "..."`
- `(javax.servlet.http.HttpServletRequest $REQ).getContentType(...)`
- `(javax.servlet.http.HttpServletRequest $REQ).getServerName(...)`
- `(javax.servlet.http.HttpServletRequest $REQ).getRequestedSessionId(...)`
- `(javax.servlet.http.HttpServletRequest $REQ).getParameterValues(...)`
- `(javax.servlet.http.HttpServletRequest $REQ).getParameterMap(...)`
- `(javax.servlet.http.HttpServletRequest $REQ).getParameterNames(...)`
- `(javax.servlet.http.HttpServletRequest $REQ).getParameter(...)`
