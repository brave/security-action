---
name: oss/mobsf.mobsfscan.network.default-http-client-tls.default-http-client-tls
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-757]
---

**Rule.** DefaultHTTPClient() with default constructor is not compatible with TLS 1.2.

**Why.** Reported as cwe-757. Ported from opengrep rule `mobsf.mobsfscan.network.default_http_client_tls.default_http_client_tls` (generated/oss/others.yaml).

## Examples

Bad:

```java
new DefaultHttpClient()
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.network.default_http_client_tls.default_http_client_tls` (metavariables start with `$`):

- `new DefaultHttpClient()`
