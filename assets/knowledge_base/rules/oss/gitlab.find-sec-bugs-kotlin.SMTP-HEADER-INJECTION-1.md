---
name: oss/gitlab.find-sec-bugs-kotlin.SMTP-HEADER-INJECTION-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-77]
---

**Rule.** Simple Mail Transfer Protocol (SMTP) is a the text based protocol used for email delivery. Like with HTTP, headers are separate by new line separator. If kuser input is place in a header line, the application should remove or replace new line characters (CR / LF). You should use a safe wrapper such as Apache Common Email and Simple Java Mail which filter special characters that can lead to header injection.

**Why.** Reported as CWE-77. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.SMTP_HEADER_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$M.setSubject($VAR)
$M.addHeader($ARG, $VAR)
$M.addHeader($VAR, $ARG)
$M.setDescription($VAR)
$M.setDisposition($VAR)
$M.setSubject($OBJ.$GETTER(...))
$M.setSubject($OBJ.$GETTER(...) + ...)
$M.setSubject(... + $OBJ.$GETTER(...))
$M.setSubject(... + $OBJ.$GETTER(...) + ...)
$M.addHeader($ARG, $OBJ.$GETTER(...))
$M.addHeader($ARG, $OBJ.$GETTER(...) + ...)
$M.addHeader($ARG, ... + $OBJ.$GETTER(...))
$M.addHeader($ARG, ... + $OBJ.$GETTER(...) + ...)
$M.addHeader($OBJ.$GETTER(...), $ARG)
$M.addHeader($OBJ.$GETTER(...) + ..., $ARG)
$M.addHeader(... + $OBJ.$GETTER(...), $ARG)
$M.addHeader(... + $OBJ.$GETTER(...) + ..., $ARG)
$M.setDescription($OBJ.$GETTER(...))
$M.setDisposition($OBJ.$GETTER(...) + ...)
$M.setDisposition(... + $OBJ.$GETTER(...))
$M.setDisposition(... + $OBJ.$GETTER(...) + ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.SMTP_HEADER_INJECTION-1` (metavariables start with `$`):

- `$M = MimeMessage(...);
...`
- `$M.setSubject($VAR)`
- `$M.addHeader($ARG, $VAR)`
- `$M.addHeader($VAR, $ARG)`
- `$M.setDescription($VAR)`
- `$M.setDisposition($VAR)`
- `^[a-zA-Z_$][a-zA-Z0-9_$]*$`
- `$M.setSubject($OBJ.$GETTER(...))`
- `$M.setSubject($OBJ.$GETTER(...) + ...)`
- `$M.setSubject(... + $OBJ.$GETTER(...))`
- `$M.setSubject(... + $OBJ.$GETTER(...) + ...)`
- `$M.addHeader($ARG, $OBJ.$GETTER(...))`
- `$M.addHeader($ARG, $OBJ.$GETTER(...) + ...)`
- `$M.addHeader($ARG, ... + $OBJ.$GETTER(...))`
- `$M.addHeader($ARG, ... + $OBJ.$GETTER(...) + ...)`
- `$M.addHeader($OBJ.$GETTER(...), $ARG)`
- `$M.addHeader($OBJ.$GETTER(...) + ..., $ARG)`
- `$M.addHeader(... + $OBJ.$GETTER(...), $ARG)`
- `$M.addHeader(... + $OBJ.$GETTER(...) + ..., $ARG)`
- `$M.setDescription($OBJ.$GETTER(...))`
- `$M.setDisposition($OBJ.$GETTER(...) + ...)`
- `$M.setDisposition(... + $OBJ.$GETTER(...))`
- `$M.setDisposition(... + $OBJ.$GETTER(...) + ...)`
- `^get`
