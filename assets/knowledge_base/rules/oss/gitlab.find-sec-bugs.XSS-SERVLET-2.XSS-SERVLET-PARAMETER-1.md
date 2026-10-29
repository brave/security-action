---
name: oss/gitlab.find-sec-bugs.XSS-SERVLET-2.XSS-SERVLET-PARAMETER-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The Servlet can read GET and POST parameters from various methods. The value obtained should be considered unsafe. You may need to validate or sanitize those values before passing them to sensitive APIs

**Why.** Reported as CWE-20. Ported from opengrep rule `gitlab.find_sec_bugs.XSS_SERVLET-2.XSS_SERVLET_PARAMETER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XSS_SERVLET-2.XSS_SERVLET_PARAMETER-1` (metavariables start with `$`):

- `$TYPE $FUNC(..., ServletRequest $REQ, ...) { ... }`
- `$REQ.getParameter(...);`
- `$REQ.getParameterValues();`
- `$REQ.getParameterMap(...);`
- `$REQ.getParameterNames();`
- `$TYPE $FUNC(..., HttpServletRequest $SREQ, ...) { ... }`
- `$SREQ.getRequestedSessionId();`
- `$SREQ.getQueryString();`
- `$SREQ.getParameter(...);`
- `$SREQ.getParameterValues();`
- `$SREQ.getParameterMap(...);`
- `$SREQ.getParameterNames();`
- `$SREQ.getHeader($HEADER);`
- `(?i)(Host|Referer|User-Agent)`
