---
name: oss/gitlab.find-sec-bugs-scala.XSS-REQUEST-PARAMETER-TO-SERVLET-WRITER-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-79]
---

**Rule.** Servlet reflected cross site scripting vulnerability

**Why.** Reported as CWE-79. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XSS_REQUEST_PARAMETER_TO_SERVLET_WRITER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$REQ.getParameter(...)
$REQ.getQueryString
// flows to sink without sanitization
$WRITER.write(...)
$RES.getWriter.write(...)
$RES.getWriter.print(...)
```

Good:

```text
Encode.forHtml(...)
org.owasp.esapi.Encoder.encodeForSQL(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XSS_REQUEST_PARAMETER_TO_SERVLET_WRITER-1` (metavariables start with `$`):

- `Encode.forHtml(...)`
- `org.owasp.esapi.Encoder.encodeForSQL(...)`
- `def $FUNC(..., $RES: HttpServletResponse, ...): $TYPE = {...}`
- `$WRITER = $RES.getWriter
...`
- `$WRITER.write(...)`
- `$RES.getWriter.write(...)`
- `$RES.getWriter.print(...)`
- `def $FUNC(..., $REQ: HttpServletRequest, ...): $TYPE = {...}`
- `$REQ.getParameter(...)`
- `$REQ.getQueryString`
