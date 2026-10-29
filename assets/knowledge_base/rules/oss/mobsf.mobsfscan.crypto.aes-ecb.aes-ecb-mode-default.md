---
name: oss/mobsf.mobsfscan.crypto.aes-ecb.aes-ecb-mode-default
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** Calling Cipher.getInstance("AES") will return AES ECB mode by default. ECB mode is known to be weak as it results in the same ciphertext for identical blocks of plaintext.

**Why.** Reported as cwe-327. Ported from opengrep rule `mobsf.mobsfscan.crypto.aes_ecb.aes_ecb_mode_default` (generated/oss/others.yaml).

## Examples

Bad:

```java
Cipher.getInstance("AES")
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.aes_ecb.aes_ecb_mode_default` (metavariables start with `$`):

- `Cipher.getInstance("AES")`
