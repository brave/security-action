---
name: oss/gitlab.find-sec-bugs-scala.CRLF-INJECTION-LOGS-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-93]
---

**Rule.** When data from an untrusted source is put into a logger and not neutralized correctly, an attacker could forge log entries or include malicious content. Inserted false entries could be used to skew statistics, distract the administrator or even to implicate another party in the commission of a malicious act. If the log file is processed automatically, the attacker can render the file unusable by corrupting the format of the file or injecting unexpected characters. An attacker may also inject code or other commands into the log file and take advantage of a vulnerability in the log processing utility (e.g. command injection or XSS).

**Why.** Reported as CWE-93. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_scala.CRLF_INJECTION_LOGS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$REQ.getParameter(...)
// flows to sink without sanitization
$LOGGER.$METHOD(...,<...$TAINTED...>,...)
Logger
log
logger
org.pmw.tinylog.Logger
org.apache.log4j.Logger
org.apache.logging.log4j.Logger
org.slf4j.Logger
org.apache.commons.logging.Log
java.util.logging.Logger
```

Good:

```text
$STR
org.owasp.encoder.Encode.forUriComponent(...)
org.owasp.encoder.Encode.forUri(...)
java.net.URLEncoder.encode(..., $CHARSET)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.CRLF_INJECTION_LOGS-1` (metavariables start with `$`):

- `$STR.replaceAll("$REPLACE_CHAR", "$REPLACE");`
- `$STR`
- `(.*\\r\\n.*)`
- `(?!(\\r\\n))`
- `org.owasp.encoder.Encode.forUriComponent(...)`
- `org.owasp.encoder.Encode.forUri(...)`
- `java.net.URLEncoder.encode(..., $CHARSET)`
- `$LOGGER.$METHOD(...,<...$TAINTED...>,...)`
- `(log|logp|logrb|entering|exiting|fine|finer|finest|info|debug|trace|warn|warning|config|error|severe)`
- `Logger`
- `log`
- `logger`
- `org.pmw.tinylog.Logger`
- `org.apache.log4j.Logger`
- `org.apache.logging.log4j.Logger`
- `org.slf4j.Logger`
- `org.apache.commons.logging.Log`
- `java.util.logging.Logger`
- `def $FUNC(..., $REQ: HttpServletRequest, ...) : $TYPE = {
  ...
}`
- `$REQ.getParameter(...)`
