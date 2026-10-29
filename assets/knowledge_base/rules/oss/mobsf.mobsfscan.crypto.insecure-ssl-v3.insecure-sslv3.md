---
name: oss/mobsf.mobsfscan.crypto.insecure-ssl-v3.insecure-sslv3
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** SSLv3 is insecure and has multiple known vulnerabilities.

**Why.** Reported as cwe-327. Ported from opengrep rule `mobsf.mobsfscan.crypto.insecure_ssl_v3.insecure_sslv3` (generated/oss/others.yaml).

## Examples

Bad:

```java
$S.getInstance("SSLv3");
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.insecure_ssl_v3.insecure_sslv3` (metavariables start with `$`):

- `$S.getInstance("SSLv3");`
