---
name: oss/gitlab.find-sec-bugs-scala.HTTP-PARAMETER-POLLUTION-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** Concatenating unvalidated user input into a URL can allow an attacker to override the value of a request parameter. Attacker may be able to override existing parameter values, inject a new parameter or exploit variables out of a direct reach. HTTP Parameter Pollution (HPP) attacks consist of injecting encoded query string delimiters into other existing parameters. If a web application does not properly sanitize the user input, a malicious user may compromise the logic of the application to perform either client-side or server-side attacks.

**Why.** Reported as CWE-88. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.HTTP_PARAMETER_POLLUTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($REQ: HttpServletRequest ).getParameter(...)
// flows to sink without sanitization
new org.apache.http.client.methods.HttpGet(...)
new org.apache.commons.httpclient.methods.GetMethod(...)
($GM: org.apache.commons.httpclient.methods.GetMethod).setQueryString(...)
```

Good:

```text
java.net.URLEncoder.encode(...)
com.google.common.net.UrlEscapers.urlPathSegmentEscaper().escape(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.HTTP_PARAMETER_POLLUTION-1` (metavariables start with `$`):

- `java.net.URLEncoder.encode(...)`
- `com.google.common.net.UrlEscapers.urlPathSegmentEscaper().escape(...)`
- `new org.apache.http.client.methods.HttpGet(...)`
- `new org.apache.commons.httpclient.methods.GetMethod(...)`
- `($GM: org.apache.commons.httpclient.methods.GetMethod).setQueryString(...)`
- `($REQ: HttpServletRequest ).getParameter(...)`
