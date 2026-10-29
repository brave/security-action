---
name: oss/gitlab.find-sec-bugs.SPRING-FILE-DISCLOSURE-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The `org.springframework.web.servlet.ModelAndView` class may potentially allow access to restricted files if called with user-supplied input. The ModelAndView class looks up a view by name to resolve a `.jsp` file. If this view name comes from user-supplied input, it could be abused to attempt to return a JSP view that the user should not have access to. Use a lookup table or hardcode which views or paths the user should be directed to. Example using a lookup table to resolve a view from a Spring MVC application: ``` @RequestMapping(value="/mvc", method=RequestMethod.GET) public ModelAndView mvc(HttpServletRequest request, HttpServletResponse response, Model model) { // Create a look up table or pull from a data source HashMap<String, String> lookupTable = new HashMap<>(); lookupTable.put("key1", "view1"); lookupTable.put("key2", "view2"); // Get user input String userInput = request.getParameter("key"); // Look up view from the user input String viewValue = lookupTable.getOrDefault(userInput, "Resource1"); // return the new model and view return new ModelAndView(viewValue); } ``` Example using a redirect instead of a `RequestDispatcher` in Spring: ``` @RequestMapping(value="/mvc", method=RequestMethod.GET) public void mvc(HttpServletRequest request, HttpServletResponse response, Model model) { // Create a look up table or pull from a data source HashMap<String, String> lookupTable = new HashMap<>(); lookupTable.put("key1", "view1"); lookupTable.put("key2", "view2"); // Get user input String userInput = request.getParameter("key"); // Look up resource to redirect to from the user input String redirectValue = lookupTable.getOrDefault(userInput, "/Resource1"); // return the new model and view response.sendRedirect(redirectValue); } ```

**Why.** Reported as CWE-552. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.SPRING_FILE_DISCLOSURE-1` (generated/oss/audit.yaml).

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
new org.springframework.web.servlet.ModelAndView($FST, ...);
$MVC.setViewName(...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SPRING_FILE_DISCLOSURE-1` (metavariables start with `$`):

- `(javax.servlet.http.HttpServletRequest $VAR).getParameter(...)`
- `(javax.servlet.http.HttpServletRequest $VAR).getParameterNames();`
- `(javax.servlet.http.HttpServletRequest $VAR).getParameterValues(...);`
- `(javax.servlet.http.HttpServletRequest $VAR).getParameterMap();`
- `(javax.servlet.http.HttpServletRequest $VAR).getHeader(...);`
- `(javax.servlet.http.HttpServletRequest $VAR).getPathInfo();`
- `$FST = $MAP.getOrDefault(..., "...");
  ...`
- `new org.springframework.web.servlet.ModelAndView($FST, ...);`
- `$FST = $MAP.getOrDefault(..., "...");
...`
- `$MVC = new org.springframework.web.servlet.ModelAndView();
...`
- `$MVC.setViewName(...);`
