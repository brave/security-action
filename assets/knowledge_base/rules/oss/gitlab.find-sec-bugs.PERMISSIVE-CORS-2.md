---
name: oss/gitlab.find-sec-bugs.PERMISSIVE-CORS-2
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** This application potentially allows user-supplied input into the value of the `Access-Control-Allow-Origin` response header. This header is part of the [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) CORS specification. By allowing user input to specify which domains can communicate with this server, an adversary could exploit a weakness in this server to force clients to send credentials (such as session identifiers) to the adversary's server. For the above attack to work, the application would need to suffer from an additional vulnerability, such as Cross-Site Scripting (XSS). To remediate this issue, do not use user-supplied information when calling `HttpServletResponse.setHeader` or `HttpServletResponse.addHeader` for the `Access-Control-Allow-Origin` header's value. Instead, hardcode the allowed domain(s) and reference them in a lookup table: Example allowing dynamic but safe domains in `Access-Control-Allow-Origin`: ``` // this data should be in the class constructor or taken from a trusted datasource Map<String, String> allowedDomains = new HashMap(); allowedDomains.put("sub1", "sub1.example.com"); allowedDomains.put("sub2", "sub2.example.com"); // extract the allowedDomain parameters value as a key to look up which domain to provide via the allowedDomains map // if not found, sets sub1 as the default String headerValue = allowedDomains.getOrDefault(request.getParameter("allowedDomain"), allowedDomains.get("sub1")); // add the header with our trusted sub1.example.com or sub2.example.com domains. response.addHeader("Access-Control-Allow-Origin", headerValue); } ``` For more information on `Access-Control-Allow-Origin` see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin

**Why.** Reported as CWE-942. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.PERMISSIVE_CORS-2` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(HttpServletRequest $REQ).getParameter(...)
(HttpServletRequest $REQ).getHeader(...)
(HttpServletRequest $REQ).getPathInfo()
(HttpServletRequest $REQ).getQueryString()
(HttpServletRequest $REQ).getAttribute(...)
(HttpServletRequest $REQ).getSession().getAttribute(...)
(HttpServletRequest $REQ).getServletContext().getAttribute(...)
(HttpServletRequest $REQ).getParameterValues(...)
(HttpServletRequest $REQ).getParameterNames()
(HttpServletRequest $REQ).getParameterMap()
// flows to sink without sanitization
(HttpServletResponse $RES).setHeader("$HEADER", ...)
(HttpServletResponse $RES).addHeader("$HEADER", ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.PERMISSIVE_CORS-2` (metavariables start with `$`):

- `(HttpServletRequest $REQ).getParameter(...)`
- `(HttpServletRequest $REQ).getHeader(...)`
- `(HttpServletRequest $REQ).getPathInfo()`
- `(HttpServletRequest $REQ).getQueryString()`
- `(HttpServletRequest $REQ).getAttribute(...)`
- `(HttpServletRequest $REQ).getSession().getAttribute(...)`
- `(HttpServletRequest $REQ).getServletContext().getAttribute(...)`
- `(HttpServletRequest $REQ).getParameterValues(...)`
- `(HttpServletRequest $REQ).getParameterNames()`
- `(HttpServletRequest $REQ).getParameterMap()`
- `(HttpServletResponse $RES).setHeader("$HEADER", ...)`
- `(HttpServletResponse $RES).addHeader("$HEADER", ...)`
- `(?i)(Access-Control-Allow-Origin)`
