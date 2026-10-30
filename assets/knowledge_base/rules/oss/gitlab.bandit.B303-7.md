---
name: oss/gitlab.bandit.B303-7
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-327]
---

**Rule.** The application was found using an insecure or risky digest or signature algorithm. MD2, MD5 and SHA1 hash algorithms have been found to be vulnerable to producing collisions. This means that two different values, when hashed, can lead to the same hash value. If the application is trying to use these hash methods for storing passwords, then it is recommended to switch to a password hashing algorithm such as Argon2id or PBKDF2. It is strongly recommended that a standard digest algorithm be chosen instead as implementing a custom algorithm is prone to errors. Example of creating a SHA-384 hash using the `cryptography` package: ``` from cryptography.hazmat.primitives import hashes # Create a SHA384 digest digest = hashes.Hash(hashes.SHA384()) # Update the digest with some initial data digest.update(b"some data to hash") # Add more data to the digest digest.update(b"some more data") # Finalize the digest as bytes result = digest.finalize() ``` For more information on secure password storage see OWASP: - https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html For more information on the cryptography module see: - https://cryptography.io/en/latest/

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.bandit.B303-7` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B303-7` (metavariables start with `$`):

- `cryptography.hazmat.primitives.hashes.MD5(...)`
