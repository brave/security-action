---
name: oss/gitlab.find-sec-bugs-scala.HRS-REQUEST-PARAMETER-TO-COOKIE-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-113]
---

**Rule.** This code constructs an HTTP Cookie using an untrusted HTTP parameter. If this cookie is added to an HTTP response, it will allow a HTTP response splitting vulnerability. See http://en.wikipedia.org/wiki/HTTP_response_splitting for more information.

**Why.** Reported as CWE-113. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.HRS_REQUEST_PARAMETER_TO_COOKIE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: HttpServletRequest).getParameter(...);
// flows to sink without sanitization
new javax.servlet.http.Cookie("$KEY", ...);
$C.setValue(...);
```

Good:

```text
$STR
org.owasp.encoder.Encode.forUriComponent(...)
org.owasp.encoder.Encode.forUri(...)
java.net.URLEncoder.encode(..., $CHARSET)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.HRS_REQUEST_PARAMETER_TO_COOKIE-1` (metavariables start with `$`):

- `$STR.replaceAll("$REPLACE_CHAR", "$REPLACE");`
- `$STR`
- `(.*\\r\\n.*)`
- `(?!(\\r\\n))`
- `org.owasp.encoder.Encode.forUriComponent(...)`
- `org.owasp.encoder.Encode.forUri(...)`
- `java.net.URLEncoder.encode(..., $CHARSET)`
- `new javax.servlet.http.Cookie("$KEY", ...);`
- `$C = new javax.servlet.http.Cookie("$KEY", ...);
...`
- `$C.setValue(...);`
- `($REQ: HttpServletRequest).getParameter(...);`
