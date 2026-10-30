---
name: oss/gitlab.find-sec-bugs-kotlin.CIPHER-INTEGRITY-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-327]
---

**Rule.** The ciphertext produced is susceptible to alteration by an adversary. This mean that the cipher provides no way to detect that the data has been tampered with. If the ciphertext can be controlled by an attacker, it could be altered without detection.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.CIPHER_INTEGRITY-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
javax.crypto.Cipher.getInstance($TRANSFORMATION, ...)
^"[^/]*(/(CBC|OFB|CTR|ECB)(/.*)?)?"$
```

Good:

```text
^"(ECIES|RSA)(/|"$)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.CIPHER_INTEGRITY-1` (metavariables start with `$`):

- `javax.crypto.Cipher.getInstance($TRANSFORMATION, ...)`
- `^"[^/]*(/(CBC|OFB|CTR|ECB)(/.*)?)?"$`
- `^"(ECIES|RSA)(/|"$)`
