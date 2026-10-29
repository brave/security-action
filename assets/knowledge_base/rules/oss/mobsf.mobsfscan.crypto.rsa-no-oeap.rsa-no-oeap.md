---
name: oss/mobsf.mobsfscan.crypto.rsa-no-oeap.rsa-no-oeap
rubric: correctness
severity: should_fix
languages: [java]
---

**Rule.** This App uses RSA Crypto without OAEP padding. The purpose of the padding scheme is to prevent a number of attacks on RSA that only work when the encryption is performed without padding.

**Why.** Reported as cwe-780. Ported from opengrep rule `mobsf.mobsfscan.crypto.rsa_no_oeap.rsa_no_oeap` (generated/oss/others.yaml).

## Examples

Bad:

```java
Cipher.getInstance($X, ...)
javax.crypto.Cipher.getInstance($X, ...)
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.rsa_no_oeap.rsa_no_oeap` (metavariables start with `$`):

- `Cipher.getInstance($X, ...)`
- `javax.crypto.Cipher.getInstance($X, ...)`
- `(?i:^.{0,100}rsa/.{1,23}/nopadding.{0,100})`
