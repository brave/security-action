---
name: oss/gitlab.find-sec-bugs.SSL-CONTEXT-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-295]
---

**Rule.** Avoid initializing SSLContext with insecure protocols like `SSL`, `SSLv2`, or `SSLv3`. These protocols are outdated and do not validate certificates by default. Additionally, these older `SSL` versions have many known security issues. Instead, use secure protocols like `TLSv1.2` or `TLSv1.3`. ``` SSLContext context = SSLContext.getInstance("TLSv1.3"); ``` For more information on see OWASP: - https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/09-Testing_for_Weak_Cryptography/01-Testing_for_Weak_SSL_TLS_Ciphers_Insufficient_Transport_Layer_Protection

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.find_sec_bugs.SSL_CONTEXT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
javax.net.ssl.SSLContext.getInstance("$PROTO", ...)
$PROP = (java.util.Properties $P).getProperty(..., "$PROTO");
...
javax.net.ssl.SSLContext.getInstance($PROP, ...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.SSL_CONTEXT-1` (metavariables start with `$`):

- `javax.net.ssl.SSLContext.getInstance("$PROTO", ...)`
- `$PROP = (java.util.Properties $P).getProperty(..., "$PROTO");
...
javax.net.ssl.SSLContext.getInstance($PROP, ...);`
