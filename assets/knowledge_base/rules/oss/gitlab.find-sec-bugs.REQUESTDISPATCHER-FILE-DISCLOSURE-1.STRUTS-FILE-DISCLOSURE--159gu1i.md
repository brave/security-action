---
name: oss/gitlab.find-sec-bugs.REQUESTDISPATCHER-FILE-DISCLOSURE-1.STRUTS-FILE-DISCLOSURE--159gu1i
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The `org.springframework.web.servlet.ModelAndView` class and `HttpRequest.getRequestDispatcher()`'s `include` and `forward` methods may potentially allow access to restricted files if called with user-supplied input. For Spring MVC, the ModelAndView class looks up a view by name to resolve a `.jsp` file. If this view name comes from user-supplied input, it could be abused to attempt to return a JSP view that the user should not have access to. The `HttpRequest.getRequestDispatcher()`'s `include` and `forward` methods will return any file that is resolvable within the web application context. This includes the `web.xml` file, any compiled classes, `jsp` files, and additional JAR or WAR libraries that are accessible. Never pass user-supplied input directly to any of these methods. Use a lookup table or hardcode which views or paths the user should be directed to. Another option is to use a simple HTTP redirect by returning an empty response body with a 301 status code and a `Location` redirect header. In Java servlets, this can be done by using the `response.sendRedirect(...)` method. Example using a lookup table to resolve a view from a Spring MVC application: ``` @RequestMapping(value="/mvc", method=RequestMethod.GET) public ModelAndView mvc(HttpServletRequest request, HttpServletResponse response, Model model) { // Create a look up table or pull from a data source HashMap<String, String> lookupTable = new HashMap<>(); lookupTable.put("key1", "view1"); lookupTable.put("key2", "view2"); // Get user input String userInput = request.getParameter("key"); // Look up view from the user input String viewValue = lookupTable.getOrDefault(userInput, userInput); // return the new model and view return new ModelAndView(viewValue); } ``` Example using a redirect instead of a `RequestDispatcher`: ``` // Create a look up table or pull from a data source HashMap<String, String> lookupTable = new HashMap<>(); lookupTable.put("key1", "/Resource1"); lookupTable.put("key2", "/Resource2"); // Get user input String userInput = request.getParameter("key"); // Look up resource to redirect to from the user input String redirectValue = lookupTable.getOrDefault(userInput, "/Resource1"); // Redirect the user response.sendRedirect(redirectValue); ```

**Why.** Reported as CWE-552. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.REQUESTDISPATCHER_FILE_DISCLOSURE-1.STRUTS_FILE_DISCLOSURE-1.SPRING_FILE_DISCLOSURE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
(javax.servlet.http.HttpServletRequest $VAR).getParameter(...)
// flows to sink without sanitization
new org.springframework.web.servlet.ModelAndView($FST);
$FST
new org.springframework.web.servlet.ModelAndView($FST, $SND);
new org.springframework.web.servlet.ModelAndView($FST, $SND, $TRD);
new org.apache.struts.action.ActionForward($FST)
new org.apache.struts.action.ActionForward($FST, $SND)
new org.apache.struts.action.ActionForward($FST, $SND, $TRD)
$SND
$TRD
$ACTION.setPath(...)
$MVC.setViewName(...);
$REQ.include($FST, $SND)
$REQ.forward($FST, $SND)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.REQUESTDISPATCHER_FILE_DISCLOSURE-1.STRUTS_FILE_DISCLOSURE-1.SPRING_FILE_DISCLOSURE-1` (metavariables start with `$`):

- `new org.springframework.web.servlet.ModelAndView($FST);`
- `$FST`
- `new org.springframework.web.servlet.ModelAndView($FST, $SND);`
- `new org.springframework.web.servlet.ModelAndView($FST, $SND, $TRD);`
- `new org.apache.struts.action.ActionForward($FST)`
- `new org.apache.struts.action.ActionForward($FST, $SND)`
- `new org.apache.struts.action.ActionForward($FST, $SND, $TRD)`
- `$SND`
- `$TRD`
- `$ACTION = new org.apache.struts.action.ActionForward();
...`
- `$ACTION.setPath(...)`
- `$MVC = new org.springframework.web.servlet.ModelAndView();
...`
- `$MVC.setViewName(...);`
- `$REQ = $HTTP.getRequestDispatcher(...);
...`
- `$REQ.include($FST, $SND)`
- `$REQ.forward($FST, $SND)`
- `(javax.servlet.http.HttpServletRequest $VAR).getParameter(...)`
