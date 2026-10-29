---
name: oss/gitlab.flawfinder.EVP-rc4-40-1.EVP-rc2-40-cbc-1.EVP-rc2-64-cbc-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The RC4 algorithm is vulnerable to many attacks and should no longer be used for encrypting data streams. Consider using libsodium's `crypto_secretstream_xchacha20poly1305` stream cipher encryption functions instead. For more information please see: https://libsodium.gitbook.io/doc/secret-key_cryptography/secretstream If you must be FIPS compliant, consider using OpenSSLs AES or 3DES ciphers.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.flawfinder.EVP_rc4_40-1.EVP_rc2_40_cbc-1.EVP_rc2_64_cbc-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.EVP_rc4_40-1.EVP_rc2_40_cbc-1.EVP_rc2_64_cbc-1` (metavariables start with `$`):

- `EVP_rc4_40(...)`
- `EVP_rc2_40_cbc(...)`
- `EVP_rc2_64_cbc(...)`
