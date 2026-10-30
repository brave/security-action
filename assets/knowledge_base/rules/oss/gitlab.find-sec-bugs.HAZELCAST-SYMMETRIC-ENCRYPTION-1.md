---
name: oss/gitlab.find-sec-bugs.HAZELCAST-SYMMETRIC-ENCRYPTION-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-326]
---

**Rule.** The network communications for Hazelcast is configured to use a deprecated symmetric cipher. Consider using TLS/SSL when establishing communications across the Hazelcast cluster. For more information on configuring TLS/SSL for Hazelcast see: https://docs.hazelcast.com/imdg/4.2/security/tls-ssl

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs.HAZELCAST_SYMMETRIC_ENCRYPTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
new com.hazelcast.config.SymmetricEncryptionConfig()
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.HAZELCAST_SYMMETRIC_ENCRYPTION-1` (metavariables start with `$`):

- `new com.hazelcast.config.SymmetricEncryptionConfig()`
