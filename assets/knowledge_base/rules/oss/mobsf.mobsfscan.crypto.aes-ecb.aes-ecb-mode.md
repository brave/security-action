---
name: oss/mobsf.mobsfscan.crypto.aes-ecb.aes-ecb-mode
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-327]
---

**Rule.** The App uses ECB mode in Cryptographic encryption algorithm. ECB mode is known to be weak as it results in the same ciphertext for identical blocks of plaintext.

**Why.** Reported as cwe-327. Ported from opengrep rule `mobsf.mobsfscan.crypto.aes_ecb.aes_ecb_mode` (generated/oss/others.yaml).

## Examples

Bad:

```java
Cipher.getInstance("=~/AES\/ECB.*/i")
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.aes_ecb.aes_ecb_mode` (metavariables start with `$`):

- `Cipher.getInstance("=~/AES\/ECB.*/i")`
