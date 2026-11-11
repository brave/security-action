---
name: oss/gitlab.find-sec-bugs-scala.PERMISSIVE-CORS-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-942]
---

**Rule.** Prior to HTML5, Web browsers enforced the Same Origin Policy which ensures that in order for JavaScript to access the contents of a Web page, both the JavaScript and the Web page must originate from the same domain. Without the Same Origin Policy, a malicious website could serve up JavaScript that loads sensitive information from other websites using a client's credentials, cull through it, and communicate it back to the attacker. HTML5 makes it possible for JavaScript to access data across domains if a new HTTP header called Access-Control-Allow-Origin is defined. With this header, a Web server defines which other domains are allowed to access its domain using cross-origin requests. However, caution should be taken when defining the header because an overly permissive CORS policy will allow a malicious application to communicate with the victim application in an inappropriate way, leading to spoofing, data theft, relay and other attacks.

**Why.** Reported as CWE-942. Ported from opengrep rule `gitlab.find_sec_bugs_scala.PERMISSIVE_CORS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.PERMISSIVE_CORS-1` (metavariables start with `$`):

- `($RESP:javax.servlet.http.HttpServletResponse).setHeader("$HEADER", "$VAL")`
- `($RESP:javax.servlet.http.HttpServletResponse).addHeader("$HEADER", "$VAL")`
- `(?i)(Access-Control-Allow-Origin)`
- `(\*|null)`
- `$REQVAL = ($REQ: javax.servlet.http.HttpServletRequest).getParameter(...)
...`
- `($RESP:javax.servlet.http.HttpServletResponse).setHeader("$HEADER", $REQVAL)`
- `($RESP:javax.servlet.http.HttpServletResponse).addHeader("$HEADER", $REQVAL)`
- `($RESP:javax.servlet.http.HttpServletResponse).setHeader("$HEADER",($REQ: javax.servlet.http.HttpServletRequest).getParameter(...))`
- `($RESP:javax.servlet.http.HttpServletResponse).addHeader("$HEADER",($REQ: javax.servlet.http.HttpServletRequest).getParameter(...))`
