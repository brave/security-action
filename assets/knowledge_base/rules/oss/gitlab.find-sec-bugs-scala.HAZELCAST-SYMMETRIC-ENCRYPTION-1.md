---
name: oss/gitlab.find-sec-bugs-scala.HAZELCAST-SYMMETRIC-ENCRYPTION-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The network communications for Hazelcast is configured to use a symmetric cipher (probably DES or Blowfish). Those ciphers alone do not provide integrity or secure authentication. The use of asymmetric encryption is preferred.

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_scala.HAZELCAST_SYMMETRIC_ENCRYPTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
new com.hazelcast.config.SymmetricEncryptionConfig()
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.HAZELCAST_SYMMETRIC_ENCRYPTION-1` (metavariables start with `$`):

- `new com.hazelcast.config.SymmetricEncryptionConfig()`
