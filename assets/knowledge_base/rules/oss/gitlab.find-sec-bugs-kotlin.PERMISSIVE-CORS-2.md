---
name: oss/gitlab.find-sec-bugs-kotlin.PERMISSIVE-CORS-2
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-942]
---

**Rule.** Prior to HTML5, Web browsers enforced the Same Origin Policy which ensures that in order for JavaScript to access the contents of a Web page, both the JavaScript and the Web page must originate from the same domain. Without the Same Origin Policy, a malicious website could serve up JavaScript that loads sensitive information from other websites using a client's credentials, cull through it, and communicate it back to the attacker. HTML5 makes it possible for JavaScript to access data across domains if a new HTTP header called Access-Control-Allow-Origin is defined. With this header, a Web server defines which other domains are allowed to access its domain using cross-origin requests. However, caution should be taken when defining the header because an overly permissive CORS policy will allow a malicious application to communicate with the victim application in an inappropriate way, leading to spoofing, data theft, relay and other attacks.

**Why.** Reported as CWE-942. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.PERMISSIVE_CORS-2` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: HttpServletRequest).getParameter(...)
($REQ: HttpServletRequest).getHeader(...)
($REQ: HttpServletRequest).getPathInfo()
($REQ: HttpServletRequest).getQueryString()
($REQ: HttpServletRequest).getAttribute(...)
($REQ: HttpServletRequest).getSession().getAttribute(...)
($REQ: HttpServletRequest).getServletContext().getAttribute(...)
($REQ: HttpServletRequest).getParameterValues(...)
($REQ: HttpServletRequest).getParameterNames()
($REQ: HttpServletRequest).getParameterMap()
// flows to sink without sanitization
($RES: HttpServletResponse).setHeader("$HEADER", ...)
($RES: HttpServletResponse).addHeader("$HEADER", ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.PERMISSIVE_CORS-2` (metavariables start with `$`):

- `($REQ: HttpServletRequest).getParameter(...)`
- `($REQ: HttpServletRequest).getHeader(...)`
- `($REQ: HttpServletRequest).getPathInfo()`
- `($REQ: HttpServletRequest).getQueryString()`
- `($REQ: HttpServletRequest).getAttribute(...)`
- `($REQ: HttpServletRequest).getSession().getAttribute(...)`
- `($REQ: HttpServletRequest).getServletContext().getAttribute(...)`
- `($REQ: HttpServletRequest).getParameterValues(...)`
- `($REQ: HttpServletRequest).getParameterNames()`
- `($REQ: HttpServletRequest).getParameterMap()`
- `($RES: HttpServletResponse).setHeader("$HEADER", ...)`
- `($RES: HttpServletResponse).addHeader("$HEADER", ...)`
- `(?i)(Access-Control-Allow-Origin)`
