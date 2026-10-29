---
name: oss/gitlab.find-sec-bugs-scala.HTTP-RESPONSE-SPLITTING-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** When an HTTP request contains unexpected CR and LF characters, the server may respond with an output stream that is interpreted as two different HTTP responses (instead of one). An attacker can control the second response and mount attacks such as cross-site scripting and cache poisoning attacks.

**Why.** Reported as CWE-113. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.HTTP_RESPONSE_SPLITTING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: javax.servlet.http.HttpServletRequest).getParameter(...)
// flows to sink without sanitization
new javax.servlet.http.Cookie("$KEY", ...)
($C:javax.servlet.http.Cookie).setValue(...)
```

Good:

```text
$STR
org.owasp.encoder.Encode.forUriComponent(...)
org.owasp.encoder.Encode.forUri(...)
java.net.URLEncoder.encode(..., $CHARSET)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.HTTP_RESPONSE_SPLITTING-1` (metavariables start with `$`):

- `$STR.replaceAll("$REPLACE_CHAR", "$REPLACE");`
- `$STR`
- `(.*\\r\\n.*)`
- `(?!(\\r\\n))`
- `org.owasp.encoder.Encode.forUriComponent(...)`
- `org.owasp.encoder.Encode.forUri(...)`
- `java.net.URLEncoder.encode(..., $CHARSET)`
- `new javax.servlet.http.Cookie("$KEY", ...)`
- `($C:javax.servlet.http.Cookie).setValue(...)`
- `($REQ: javax.servlet.http.HttpServletRequest).getParameter(...)`
