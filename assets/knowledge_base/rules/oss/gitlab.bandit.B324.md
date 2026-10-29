---
name: oss/gitlab.bandit.B324
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found using an insecure or risky digest or signature algorithm. MD2, MD4, MD5 and SHA1 hash algorithms have been found to be vulnerable to producing collisions. This means that two different values, when hashed, can lead to the same hash value. If the application is trying to use these hash methods for storing passwords, then it is recommended to switch to a password hashing algorithm such as Argon2id or PBKDF2. It is strongly recommended that a standard digest algorithm be chosen instead as implementing a custom algorithm is prone to errors. Example using `hashlib.sha384()` to create a SHA384 hash: ``` import hashlib # Create a SHA384 digest digest = hashlib.sha384() # Update the digest with some initial data digest.update(b"some data to hash") # Add more data to the digest digest.update(b"some more data") # Finalize the digest as bytes digest.digest() ```

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.bandit.B324` (generated/oss/audit.yaml).

## Examples

Bad:

```python
hashlib.new("=~/[M|m][D|d][4|5]/", ...)
hashlib.new(..., name="=~/[M|m][D|d][4|5]/", ...)
hashlib.new('sha1')
hashlib.new(..., name='SHA1')
hashlib.new('sha', string='test')
hashlib.new(name='SHA', string='test')
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B324` (metavariables start with `$`):

- `hashlib.new("=~/[M|m][D|d][4|5]/", ...)`
- `hashlib.new(..., name="=~/[M|m][D|d][4|5]/", ...)`
- `hashlib.new('sha1')`
- `hashlib.new(..., name='SHA1')`
- `hashlib.new('sha', string='test')`
- `hashlib.new(name='SHA', string='test')`
