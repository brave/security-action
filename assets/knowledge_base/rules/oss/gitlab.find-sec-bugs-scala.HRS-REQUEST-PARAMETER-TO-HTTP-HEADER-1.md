---
name: oss/gitlab.find-sec-bugs-scala.HRS-REQUEST-PARAMETER-TO-HTTP-HEADER-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** This code directly writes an HTTP parameter to an HTTP header, which allows for a HTTP response splitting vulnerability. See http://en.wikipedia.org/wiki/HTTP_response_splitting for more information.

**Why.** Reported as CWE-113. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.HRS_REQUEST_PARAMETER_TO_HTTP_HEADER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: HttpServletRequest).getParameter(...);
// flows to sink without sanitization
($RES: HttpServletResponse).setHeader("$KEY", ...);
($RES: HttpServletResponse).addHeader("$KEY", ...);
($WRP: HttpServletResponseWrapper).setHeader("$KEY", ...);
($WRP: HttpServletResponseWrapper).addHeader("$KEY", ...);
```

Good:

```text
$STR
org.owasp.encoder.Encode.forUriComponent(...)
org.owasp.encoder.Encode.forUri(...)
java.net.URLEncoder.encode(..., $CHARSET)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.HRS_REQUEST_PARAMETER_TO_HTTP_HEADER-1` (metavariables start with `$`):

- `$STR.replaceAll("$REPLACE_CHAR", "$REPLACE");`
- `$STR`
- `(.*\\r\\n.*)`
- `(?!(\\r\\n))`
- `org.owasp.encoder.Encode.forUriComponent(...)`
- `org.owasp.encoder.Encode.forUri(...)`
- `java.net.URLEncoder.encode(..., $CHARSET)`
- `($RES: HttpServletResponse).setHeader("$KEY", ...);`
- `($RES: HttpServletResponse).addHeader("$KEY", ...);`
- `($WRP: HttpServletResponseWrapper).setHeader("$KEY", ...);`
- `($WRP: HttpServletResponseWrapper).addHeader("$KEY", ...);`
- `($REQ: HttpServletRequest).getParameter(...);`
