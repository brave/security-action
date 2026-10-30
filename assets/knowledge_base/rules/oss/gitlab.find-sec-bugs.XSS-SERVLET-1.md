---
name: oss/gitlab.find-sec-bugs.XSS-SERVLET-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-79]
---

**Rule.** A potential XSS was found. It could be used to execute unwanted JavaScript in a client's browser.

**Why.** Reported as CWE-79. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.XSS_SERVLET-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$REQ.getParameter(...);
// flows to sink without sanitization
$WRITER.write($DATA,...);
$DATA
$RES.getWriter().write($DATA,...);
```

Good:

```java
$TAINTED
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.XSS_SERVLET-1` (metavariables start with `$`):

- `org.owasp.encoder.Encode.forHtml($TAINTED);`
- `$TAINTED`
- `$FUNC(..., HttpServletResponse $RES, ...) {...}`
- `$WRITER = $RES.getWriter();
...`
- `$WRITER.write($DATA,...);`
- `$DATA`
- `$RES.getWriter().write($DATA,...);`
- `$FUNC(..., HttpServletRequest $REQ, ...) {...}`
- `$REQ.getParameter(...);`
