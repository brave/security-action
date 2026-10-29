---
name: oss/gitlab.find-sec-bugs-kotlin.INSECURE-SMTP-SSL-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** Server identity verification is disabled when making SSL connections.

**Why.** Reported as CWE-297. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.INSECURE_SMTP_SSL-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

Good:

```text
$E.setSSLOnConnect(true)
...
$E.setSSLCheckServerIdentity(true)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.INSECURE_SMTP_SSL-1` (metavariables start with `$`):

- `$E = org.apache.commons.mail.SimpleEmail(...)
...`
- `$E = org.apache.commons.mail.Email(...)
...`
- `$E = org.apache.commons.mail.MultiPartEmail(...)
...`
- `$E = org.apache.commons.mail.HtmlEmail(...)
...`
- `$E = org.apache.commons.mail.ImageHtmlEmail(...)
...`
- `$E.setSSLOnConnect(true)
...
$E.setSSLCheckServerIdentity(true)`
