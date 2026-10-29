---
name: oss/gitlab.find-sec-bugs-kotlin.WEAK-MESSAGE-DIGEST-MD5-1.WEAK-MESSAGE-DIGEST-SHA1-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** DES is considered strong ciphers for modern applications. Currently, NIST recommends the usage of AES block ciphers instead of DES.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.WEAK_MESSAGE_DIGEST_MD5-1.WEAK_MESSAGE_DIGEST_SHA1-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
MessageDigest.getInstance($ALG, ...)
Signature.getInstance($ALG, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.WEAK_MESSAGE_DIGEST_MD5-1.WEAK_MESSAGE_DIGEST_SHA1-1` (metavariables start with `$`):

- `MessageDigest.getInstance($ALG, ...)`
- `Signature.getInstance($ALG, ...)`
- `.*(MD5|MD4|MD2|SHA1|SHA-1).*`
