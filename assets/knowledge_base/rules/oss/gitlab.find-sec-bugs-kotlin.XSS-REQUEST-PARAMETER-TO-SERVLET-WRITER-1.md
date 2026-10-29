---
name: oss/gitlab.find-sec-bugs-kotlin.XSS-REQUEST-PARAMETER-TO-SERVLET-WRITER-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** Servlet reflected cross site scripting vulnerability

**Why.** Reported as CWE-79. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.XSS_REQUEST_PARAMETER_TO_SERVLET_WRITER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$REQ.getParameter(...);
// flows to sink without sanitization
$WRITER.write($DATA,...);
$DATA
$RES.getWriter().write($DATA,...);
```

Good:

```text
$TAINTED
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.XSS_REQUEST_PARAMETER_TO_SERVLET_WRITER-1` (metavariables start with `$`):

- `org.owasp.encoder.Encode.forHtml($TAINTED);`
- `$TAINTED`
- `fun $FUNC(..., $RES: HttpServletResponse , ...) {...}`
- `$WRITER = $RES.getWriter();
...`
- `$WRITER.write($DATA,...);`
- `$DATA`
- `$RES.getWriter().write($DATA,...);`
- `fun $FUNC(..., $REQ: HttpServletRequest , ...) {...}`
- `$REQ.getParameter(...);`
