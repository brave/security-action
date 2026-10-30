---
name: oss/gitlab.find-sec-bugs-scala.REQUESTDISPATCHER-FILE-DISCLOSURE-1.STRUTS-FILE-DISCL-g3du13
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-552]
---

**Rule.** Constructing a server-side redirect path with user input could allow an attacker to download application binaries (including application classes or jar files) or view arbitrary files within protected directories.

**Why.** Reported as CWE-552. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.REQUESTDISPATCHER_FILE_DISCLOSURE-1.STRUTS_FILE_DISCLOSURE-1.SPRING_FILE_DISCLOSURE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
($VAR: javax.servlet.http.HttpServletRequest).getParameter(...)
// flows to sink without sanitization
new org.springframework.web.servlet.ModelAndView($FST)
$FST
new org.springframework.web.servlet.ModelAndView($FST, $SND)
new org.springframework.web.servlet.ModelAndView($FST, $SND, $TRD)
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

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.REQUESTDISPATCHER_FILE_DISCLOSURE-1.STRUTS_FILE_DISCLOSURE-1.SPRING_FILE_DISCLOSURE-1` (metavariables start with `$`):

- `new org.springframework.web.servlet.ModelAndView($FST)`
- `$FST`
- `new org.springframework.web.servlet.ModelAndView($FST, $SND)`
- `new org.springframework.web.servlet.ModelAndView($FST, $SND, $TRD)`
- `new org.apache.struts.action.ActionForward($FST)`
- `new org.apache.struts.action.ActionForward($FST, $SND)`
- `new org.apache.struts.action.ActionForward($FST, $SND, $TRD)`
- `$SND`
- `$TRD`
- `$ACTION = new org.apache.struts.action.ActionForward()
...`
- `$ACTION.setPath(...)`
- `$MVC = new org.springframework.web.servlet.ModelAndView()
...`
- `$MVC.setViewName(...);`
- `$REQ = $HTTP.getRequestDispatcher(...)
...`
- `$REQ.include($FST, $SND)`
- `$REQ.forward($FST, $SND)`
- `($VAR: javax.servlet.http.HttpServletRequest).getParameter(...)`
