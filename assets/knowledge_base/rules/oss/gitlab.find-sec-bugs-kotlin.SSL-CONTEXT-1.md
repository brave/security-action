---
name: oss/gitlab.find-sec-bugs-kotlin.SSL-CONTEXT-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-295]
---

**Rule.** A HostnameVerifier that accept any host are often use because of certificate reuse on many hosts. As a consequence, this is vulnerable to Man-in-the-middleattacks attacks since the client will trust any certificate.

**Why.** Reported as CWE-295. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.SSL_CONTEXT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
org.apache.http.impl.client.DefaultHttpClient()
javax.net.ssl.SSLContext.getInstance("SSL")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.SSL_CONTEXT-1` (metavariables start with `$`):

- `org.apache.http.impl.client.DefaultHttpClient()`
- `javax.net.ssl.SSLContext.getInstance("SSL")`
