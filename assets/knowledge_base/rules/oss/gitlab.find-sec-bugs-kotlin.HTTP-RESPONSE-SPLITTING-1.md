---
name: oss/gitlab.find-sec-bugs-kotlin.HTTP-RESPONSE-SPLITTING-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** When an HTTP request contains unexpected CR and LF characters, the server may respond with an output stream that is interpreted as two different HTTP responses (instead of one). An attacker can control the second response and mount attacks such as cross-site scripting and cache poisoning attacks.

**Why.** Reported as CWE-113. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.HTTP_RESPONSE_SPLITTING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: javax.servlet.http.HttpServletRequest).getParameter(...)
($REQ: javax.servlet.http.HttpServletRequest).getParameterNames()
($REQ: javax.servlet.http.HttpServletRequest).getParameterValues(...)
($REQ: javax.servlet.http.HttpServletRequest).getParameterMap()
($REQ: javax.servlet.http.HttpServletRequest).getHeader(...)
($REQ: javax.servlet.http.HttpServletRequest).getPathInfo()
// flows to sink without sanitization
javax.servlet.http.Cookie("$KEY", ...)
$C.setValue(...)
```

Good:

```text
...
""
.*\[\]?(?=[^]]*\\r)(?=[^]]*\\n)[^]]*\]\+
org.apache.commons.text.StringEscapeUtils.escapeJava(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.HTTP_RESPONSE_SPLITTING-1` (metavariables start with `$`):

- `...`
- `""`
- `.*\[\]?(?=[^]]*\\r)(?=[^]]*\\n)[^]]*\]\+`
- `$STR.replace($PATTERN, $S0)
...`
- `org.apache.commons.text.StringEscapeUtils.escapeJava(...)`
- `javax.servlet.http.Cookie("$KEY", ...)`
- `$C = javax.servlet.http.Cookie("$KEY", ...)
...`
- `$C.setValue(...)`
- `($REQ: javax.servlet.http.HttpServletRequest).getParameter(...)`
- `($REQ: javax.servlet.http.HttpServletRequest).getParameterNames()`
- `($REQ: javax.servlet.http.HttpServletRequest).getParameterValues(...)`
- `($REQ: javax.servlet.http.HttpServletRequest).getParameterMap()`
- `($REQ: javax.servlet.http.HttpServletRequest).getHeader(...)`
- `($REQ: javax.servlet.http.HttpServletRequest).getPathInfo()`
