---
name: oss/gitlab.find-sec-bugs-scala.XSS-SERVLET-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-79]
---

**Rule.** A potential XSS was found. It could be used to execute unwanted JavaScript in a client's browser.

**Why.** Reported as CWE-79. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.XSS_SERVLET-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$REQ.getParameter(...);
// flows to sink without sanitization
$WRITER.write($DATA,...);
$DATA
$RES.getWriter.write($DATA,...);
```

Good:

```text
$TAINTED
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.XSS_SERVLET-1` (metavariables start with `$`):

- `org.owasp.encoder.Encode.forHtml($TAINTED);`
- `$TAINTED`
- `def $FUNC(..., $RES: HttpServletResponse, ...): $TYPE = {...}`
- `$WRITER = $RES.getWriter;
...`
- `$WRITER.write($DATA,...);`
- `$DATA`
- `$RES.getWriter.write($DATA,...);`
- `def $FUNC(..., $REQ: HttpServletRequest, ...): $TYPE = {...}`
- `$REQ.getParameter(...);`
