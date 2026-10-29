---
name: oss/gitlab.find-sec-bugs-scala.SMTP-HEADER-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-77]
---

**Rule.** Simple Mail Transfer Protocol (SMTP) is a the text based protocol used for email delivery. Like with HTTP, headers are separate by new line separator. If kuser input is place in a header line, the application should remove or replace new line characters (CR / LF). You should use a safe wrapper such as Apache Common Email and Simple Java Mail which filter special characters that can lead to header injection.

**Why.** Reported as CWE-77. Ported from opengrep rule `gitlab.find_sec_bugs_scala.SMTP_HEADER_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$M.setSubject($ARG);
$M.addHeader($ARG1, $ARG2)
$M.setDescription($ARG)
$M.setDisposition($ARG)
```

Good:

```text
$M.setSubject("...")
$M.addHeader("...", "...")
$M.setDescription("...")
$M.setDisposition("...")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.SMTP_HEADER_INJECTION-1` (metavariables start with `$`):

- `$M = new MimeMessage(...);
...`
- `$M.setSubject($ARG);`
- `$M.setSubject("...")`
- `$M.addHeader($ARG1, $ARG2)`
- `$M.addHeader("...", "...")`
- `$M.setDescription($ARG)`
- `$M.setDescription("...")`
- `$M.setDisposition($ARG)`
- `$M.setDisposition("...")`
