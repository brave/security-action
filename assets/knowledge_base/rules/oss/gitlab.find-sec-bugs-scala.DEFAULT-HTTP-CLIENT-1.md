---
name: oss/gitlab.find-sec-bugs-scala.DEFAULT-HTTP-CLIENT-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-326]
---

**Rule.** DefaultHttpClient with default constructor is not compatible with TLS 1.2

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_scala.DEFAULT_HTTP_CLIENT-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
new org.apache.http.impl.client.DefaultHttpClient(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.DEFAULT_HTTP_CLIENT-1` (metavariables start with `$`):

- `new org.apache.http.impl.client.DefaultHttpClient(...)`
