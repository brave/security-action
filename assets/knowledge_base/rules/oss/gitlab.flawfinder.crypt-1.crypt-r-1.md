---
name: oss/gitlab.flawfinder.crypt-1.crypt-r-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The crypt functions are not recommended due to the significantly small key space. Modern hardware can crack crypt produced passwords relatively quickly. Consider using the Argon2id password hashing algorithm provided by libsodium. For more information please see: https://libsodium.gitbook.io/doc/password_hashing.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.flawfinder.crypt-1.crypt_r-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.crypt-1.crypt_r-1` (metavariables start with `$`):

- `crypt(...)`
- `crypt_r(...)`
