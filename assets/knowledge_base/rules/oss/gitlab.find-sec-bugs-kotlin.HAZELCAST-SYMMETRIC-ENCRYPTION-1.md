---
name: oss/gitlab.find-sec-bugs-kotlin.HAZELCAST-SYMMETRIC-ENCRYPTION-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-326]
---

**Rule.** The network communications for Hazelcast is configured to use a symmetric cipher (probably DES or Blowfish). Those ciphers alone do not provide integrity or secure authentication. The use of asymmetric encryption is preferred.

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.HAZELCAST_SYMMETRIC_ENCRYPTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.HAZELCAST_SYMMETRIC_ENCRYPTION-1` (metavariables start with `$`):

- `com.hazelcast.config.SymmetricEncryptionConfig()`
