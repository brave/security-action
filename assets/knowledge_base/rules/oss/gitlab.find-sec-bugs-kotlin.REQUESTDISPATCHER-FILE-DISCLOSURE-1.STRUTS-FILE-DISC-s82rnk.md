---
name: oss/gitlab.find-sec-bugs-kotlin.REQUESTDISPATCHER-FILE-DISCLOSURE-1.STRUTS-FILE-DISC-s82rnk
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-552]
---

**Rule.** Constructing a server-side redirect path with user input could allow an attacker to download application binaries (including application classes or jar files) or view arbitrary files within protected directories.

**Why.** Reported as CWE-552. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.REQUESTDISPATCHER_FILE_DISCLOSURE-1.STRUTS_FILE_DISCLOSURE-1.SPRING_FILE_DISCLOSURE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($VAR: javax.servlet.http.HttpServletRequest).getParameter(...)
// flows to sink without sanitization
org.springframework.web.servlet.ModelAndView($FST);
$FST
org.springframework.web.servlet.ModelAndView($FST, $SND);
org.springframework.web.servlet.ModelAndView($FST, $SND, $TRD);
org.apache.struts.action.ActionForward($FST)
org.apache.struts.action.ActionForward($FST, $SND)
org.apache.struts.action.ActionForward($FST, $SND, $TRD)
$SND
$TRD
$ACTION.setPath(...)
$MVC.setViewName(...);
$REQ.include($FST, $SND)
$REQ.forward($FST, $SND)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.REQUESTDISPATCHER_FILE_DISCLOSURE-1.STRUTS_FILE_DISCLOSURE-1.SPRING_FILE_DISCLOSURE-1` (metavariables start with `$`):

- `org.springframework.web.servlet.ModelAndView($FST);`
- `$FST`
- `org.springframework.web.servlet.ModelAndView($FST, $SND);`
- `org.springframework.web.servlet.ModelAndView($FST, $SND, $TRD);`
- `org.apache.struts.action.ActionForward($FST)`
- `org.apache.struts.action.ActionForward($FST, $SND)`
- `org.apache.struts.action.ActionForward($FST, $SND, $TRD)`
- `$SND`
- `$TRD`
- `$ACTION = org.apache.struts.action.ActionForward();
...`
- `$ACTION.setPath(...)`
- `$MVC = org.springframework.web.servlet.ModelAndView();
...`
- `$MVC.setViewName(...);`
- `$REQ = $HTTP.getRequestDispatcher(...);
...`
- `$REQ.include($FST, $SND)`
- `$REQ.forward($FST, $SND)`
- `($VAR: javax.servlet.http.HttpServletRequest).getParameter(...)`
