---
name: oss/mobsf.mobsfscan.crypto.cbc-padding-oracle.cbc-padding-oracle
rubric: correctness
severity: should_fix
languages: [java]
cwe: [cwe-649]
---

**Rule.** The App uses the encryption mode CBC with PKCS5/PKCS7 padding. This configuration is vulnerable to padding oracle attacks.

**Why.** Reported as cwe-649. Ported from opengrep rule `mobsf.mobsfscan.crypto.cbc_padding_oracle.cbc_padding_oracle` (generated/oss/others.yaml).

## Examples

Bad:

```java
Cipher.getInstance("AES/CBC/PKCS5Padding")
Cipher.getInstance("Blowfish/CBC/PKCS5Padding")
Cipher.getInstance("DES/CBC/PKCS5Padding")
Cipher.getInstance("AES/CBC/PKCS7Padding")
Cipher.getInstance("Blowfish/CBC/PKCS7Padding")
Cipher.getInstance("DES/CBC/PKCS7Padding")
```

## Detection hints

Literal patterns from opengrep rule `mobsf.mobsfscan.crypto.cbc_padding_oracle.cbc_padding_oracle` (metavariables start with `$`):

- `Cipher.getInstance("AES/CBC/PKCS5Padding")`
- `Cipher.getInstance("Blowfish/CBC/PKCS5Padding")`
- `Cipher.getInstance("DES/CBC/PKCS5Padding")`
- `Cipher.getInstance("AES/CBC/PKCS7Padding")`
- `Cipher.getInstance("Blowfish/CBC/PKCS7Padding")`
- `Cipher.getInstance("DES/CBC/PKCS7Padding")`
