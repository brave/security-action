---
name: oss/gitlab.find-sec-bugs-kotlin.HRS-REQUEST-PARAMETER-TO-HTTP-HEADER-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-113]
---

**Rule.** This code directly writes an HTTP parameter to an HTTP header, which allows for a HTTP response splitting vulnerability. See http://en.wikipedia.org/wiki/HTTP_response_splitting for more information.

**Why.** Reported as CWE-113. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.HRS_REQUEST_PARAMETER_TO_HTTP_HEADER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: $X.servlet.http.HttpServletRequest).getParameter(...);
($REQ: $X.servlet.http.HttpServletRequest).getParameterNames();
($REQ: $X.servlet.http.HttpServletRequest).getParameterValues(...);
($REQ: $X.servlet.http.HttpServletRequest).getParameterMap();
($REQ: $X.servlet.http.HttpServletRequest).getHeader(...);
($REQ: $X.servlet.http.HttpServletRequest).getPathInfo();
// flows to sink without sanitization
($RES: $X.servlet.http.HttpServletResponse).setHeader("$KEY", ...);
($RES: $X.servlet.http.HttpServletResponse).addHeader("$KEY", ...);
($WRP: $X.servlet.http.HttpServletResponseWrapper).setHeader("$KEY", ...);
($WRP: $X.servlet.http.HttpServletResponseWrapper).addHeader("$KEY", ...);
```

Good:

```text
...
""
.*\[\]?(?=[^]]*\\r)(?=[^]]*\\n)[^]]*\]\+
org.apache.commons.text.StringEscapeUtils.unescapeJava(...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.HRS_REQUEST_PARAMETER_TO_HTTP_HEADER-1` (metavariables start with `$`):

- `...`
- `""`
- `.*\[\]?(?=[^]]*\\r)(?=[^]]*\\n)[^]]*\]\+`
- `$STR.replace($PATTERN, $S0);
...`
- `org.apache.commons.text.StringEscapeUtils.unescapeJava(...);`
- `($RES: $X.servlet.http.HttpServletResponse).setHeader("$KEY", ...);`
- `($RES: $X.servlet.http.HttpServletResponse).addHeader("$KEY", ...);`
- `($WRP: $X.servlet.http.HttpServletResponseWrapper).setHeader("$KEY", ...);`
- `($WRP: $X.servlet.http.HttpServletResponseWrapper).addHeader("$KEY", ...);`
- `($REQ: $X.servlet.http.HttpServletRequest).getParameter(...);`
- `($REQ: $X.servlet.http.HttpServletRequest).getParameterNames();`
- `($REQ: $X.servlet.http.HttpServletRequest).getParameterValues(...);`
- `($REQ: $X.servlet.http.HttpServletRequest).getParameterMap();`
- `($REQ: $X.servlet.http.HttpServletRequest).getHeader(...);`
- `($REQ: $X.servlet.http.HttpServletRequest).getPathInfo();`
