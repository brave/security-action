---
name: oss/gitlab.find-sec-bugs.UNVALIDATED-REDIRECT-1.URL-REWRITING-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-601]
---

**Rule.** Unvalidated redirects occur when an application redirects a user to a destination URL specified by a user supplied parameter that is not validated. Such vulnerabilities can be used to facilitate phishing attacks. To avoid open redirect vulnerabilities in Java, one effective strategy is to only allow redirection to URLs that are pre-defined in a safe list. This safe list can be implemented using a collection like a Map, List, or Dictionary, where you store all the valid URLs or URL patterns. When a redirect request is made, you can check if the requested URL is in this safe list before proceeding with the redirection. For example: ``` protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException { private List<String> safeUrls = new ArrayList<>(); safeUrls.add("/home"); safeUrls.add("/user/profile"); safeUrls.add("/dashboard"); String redirectUrl = request.getParameter("url"); if (safeUrls.contains(redirectUrl)) { response.sendRedirect(redirectUrl); } else { response.sendRedirect("/errorPage"); } }" ```

**Why.** Reported as CWE-601. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.UNVALIDATED_REDIRECT-1.URL_REWRITING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$URL = ($X.servlet.http.HttpServletRequest $REQ).$M(...);
// flows to sink without sanitization
($X.servlet.http.HttpServletResponse $RES).sendRedirect($URL)
($X.servlet.http.HttpServletResponse $RES).addHeader("Location", $URL)
```

Good:

```java
($X.servlet.http.HttpServletResponse $RES).sendRedirect($URL)
($X.servlet.http.HttpServletResponse $RES).addHeader("Location", $URL)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.UNVALIDATED_REDIRECT-1.URL_REWRITING-1` (metavariables start with `$`):

- `$URL = ($X.servlet.http.HttpServletRequest $REQ).$M(...);`
- `(getParameter|getCookies|getHeader|getHeaders|getHeaderNames|getPathInfo|getPathTranslated|getContextPath|getQueryString|getRemoteUser|getRequestedSessionId|getRequestURI|getRequestURL|getServletPath|getParts|getPart|getReader)`
- `($X.servlet.http.HttpServletResponse $RES).sendRedirect($URL)`
- `($X.servlet.http.HttpServletResponse $RES).addHeader("Location", $URL)`
- `if ($SAFE.contains($URL)){
  ...
}`
