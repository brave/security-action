---
name: oss/gitlab.flawfinder.EVP-des-ecb-1.EVP-des-cbc-1.EVP-des-cfb-1.EVP-des-ofb-1.EVP-de-9etwzn
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-327]
---

**Rule.** The DES algorithm has not been recommended for over 15 years and was withdrawn from NIST (FIPS 46-3) in 2005. Consider using libsodium's `crypto_secretbox_easy` authenticated encryption functions instead. For more information please see: https://libsodium.gitbook.io/doc/secret-key_cryptography/secretbox. If you must be FIPS compliant, consider using OpenSSLs AES or 3DES ciphers.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.flawfinder.EVP_des_ecb-1.EVP_des_cbc-1.EVP_des_cfb-1.EVP_des_ofb-1.EVP_desx_cbc-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.EVP_des_ecb-1.EVP_des_cbc-1.EVP_des_cfb-1.EVP_des_ofb-1.EVP_desx_cbc-1` (metavariables start with `$`):

- `EVP_des_ecb(...)`
- `EVP_des_cbc(...)`
- `EVP_des_cfb(...)`
- `EVP_des_ofb(...)`
- `EVP_desx_cbc(...)`
