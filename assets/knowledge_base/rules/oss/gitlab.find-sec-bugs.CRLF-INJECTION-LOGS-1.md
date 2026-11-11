---
name: oss/gitlab.find-sec-bugs.CRLF-INJECTION-LOGS-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-93]
---

**Rule.** The application was found to take data from user input and output it into a logger method. When data from an untrusted source is sent to a logger without validation, an attacker could forge log entries or include malicious content. If the log file is processed automatically, the attacker can render the file unusable by corrupting the format of the file or injecting unexpected characters. An attacker may also inject code or other commands into the log file and take advantage of a vulnerability in the log processing utility (e.g. command injection or XSS). To mitigate this issue, encode values that come from user input with a package such as [Apache Commons Text](https://commons.apache.org/proper/commons-text/) to escape the input: ``` public String escapeValue(String value) { return StringEscapeUtils.escapeJava(value); } ``` For more information on log injection see OWASP: https://owasp.org/www-community/attacks/Log_Injection

**Why.** Reported as CWE-93. Ported from opengrep rule `gitlab.find_sec_bugs.CRLF_INJECTION_LOGS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$LOGGER.$METHOD(...,$TAINTED,...);
$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$VAR = String.Format(..., $TAINTED,...);
...
$LOGGER.$METHOD(...,$VAR,...);
$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$LOGGER.$METHOD(...,String.Format(..., $TAINTED,...),...);
$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$VAR = ... + $TAINTED + ...;
...
$LOGGER.$METHOD(...,$VAR,...);
$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$LOGGER.$METHOD(...,... + $TAINTED + ...,...);
(Logger $LOG)
org.pmw.tinylog.Logger
org.apache.log4j.Logger
org.apache.logging.log4j.Logger
org.slf4j.Logger
org.apache.commons.logging.Log
java.util.logging.Logger
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.CRLF_INJECTION_LOGS-1` (metavariables start with `$`):

- `$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$LOGGER.$METHOD(...,$TAINTED,...);`
- `$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$VAR = String.Format(..., $TAINTED,...);
...
$LOGGER.$METHOD(...,$VAR,...);`
- `$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$LOGGER.$METHOD(...,String.Format(..., $TAINTED,...),...);`
- `$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$VAR = ... + $TAINTED + ...;
...
$LOGGER.$METHOD(...,$VAR,...);`
- `$TAINTED = (HttpServletRequest $REQ).getParameter(...);
...
$LOGGER.$METHOD(...,... + $TAINTED + ...,...);`
- `(log|logp|logrb|entering|exiting|fine|finer|finest|info|debug|trace|warn|warning|config|error|severe)`
- `(Logger $LOG)`
- `org.pmw.tinylog.Logger`
- `org.apache.log4j.Logger`
- `org.apache.logging.log4j.Logger`
- `org.slf4j.Logger`
- `org.apache.commons.logging.Log`
- `java.util.logging.Logger`
