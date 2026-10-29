---
name: oss/gitlab.find-sec-bugs.REQUESTDISPATCHER-FILE-DISCLOSURE-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The `HttpRequest.getRequestDispatcher()`'s `include` and `forward` methods will return any file that is resolvable within the web application context. This includes the `web.xml` file, any compiled classes, `jsp` files, and additional JAR or WAR libraries that are accessible. Never pass user-supplied input directly to any of these methods. Use a lookup table or hardcode which views or paths the user should be directed to. Another option is to use a simple HTTP redirect by returning an empty response body with a 301 status code and a `Location` redirect header. In Java servlets, this can be done by using the `response.sendRedirect(...)` method. Example using a redirect instead of a `RequestDispatcher`: ``` // Create a look up table or pull from a data source HashMap<String, String> lookupTable = new HashMap<>(); lookupTable.put("key1", "/Resource1"); lookupTable.put("key2", "/Resource2"); // Get user input String userInput = request.getParameter("key"); // Look up resource to redirect to from the user input String redirectValue = lookupTable.getOrDefault(userInput, "/Resource1"); // Redirect the user response.sendRedirect(redirectValue); ```

**Why.** Reported as CWE-552. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.REQUESTDISPATCHER_FILE_DISCLOSURE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(javax.servlet.http.HttpServletRequest $VAR).getParameter(...)
(javax.servlet.http.HttpServletRequest $VAR).getParameterNames();
(javax.servlet.http.HttpServletRequest $VAR).getParameterValues(...);
(javax.servlet.http.HttpServletRequest $VAR).getParameterMap();
(javax.servlet.http.HttpServletRequest $VAR).getHeader(...);
(javax.servlet.http.HttpServletRequest $VAR).getPathInfo();
// flows to sink without sanitization
$REQ.include($FST, $SND)
$REQ.forward($FST, $SND)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.REQUESTDISPATCHER_FILE_DISCLOSURE-1` (metavariables start with `$`):

- `(javax.servlet.http.HttpServletRequest $VAR).getParameter(...)`
- `(javax.servlet.http.HttpServletRequest $VAR).getParameterNames();`
- `(javax.servlet.http.HttpServletRequest $VAR).getParameterValues(...);`
- `(javax.servlet.http.HttpServletRequest $VAR).getParameterMap();`
- `(javax.servlet.http.HttpServletRequest $VAR).getHeader(...);`
- `(javax.servlet.http.HttpServletRequest $VAR).getPathInfo();`
- `$VAL = $MAP.getOrDefault(..., "...");
...`
- `$REQ = $HTTP.getRequestDispatcher(...);
...`
- `$REQ.include($FST, $SND)`
- `$REQ.forward($FST, $SND)`
