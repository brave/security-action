---
name: oss/mobsf.mobsfscan.crypto.weak-ciphers.weak-cipher
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** Weak encryption algorithm identified. This algorithm is vulnerable to cryptographic attacks.

**Why.** Reported as cwe-327. Ported from opengrep rule `mobsf.mobsfscan.crypto.weak_ciphers.weak_cipher` (generated/oss/others.yaml).

## Examples

Bad:

```java
$C.getInstance("=~/des|desede|rc2|rc4|blowfish/i", ...);
$C = new NullCipher();
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.weak_ciphers.weak_cipher` (metavariables start with `$`):

- `$C.getInstance("=~/des|desede|rc2|rc4|blowfish/i", ...);`
- `$C = new NullCipher();`
