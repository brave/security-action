---
name: oss/gitlab.bandit.B311
rubric: safety
severity: nit
languages: [python]
---

**Rule.** Depending on the context, generating weak random numbers may expose cryptographic functions, which rely on these numbers, to be exploitable. When generating numbers for sensitive values such as tokens, nonces, and cryptographic keys, it is recommended that the `secrets` module be used instead. Example using the secrets module: ``` import secrets # Generate a secure random 64 byte array random_bytes = secrets.token_bytes(64) print(random_bytes) # Generate a secure random 64 byte array as a hex string random_bytes_hex = secrets.token_hex(64) # Generate a secure random 64 byte array base64 encoded for use in URLs random_string = secrets.token_urlsafe(64) ``` For more information on the `secrets` module see: - https://docs.python.org/3/library/secrets.html

**Why.** Reported as CWE-330. Ported from opengrep rule `gitlab.bandit.B311` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B311` (metavariables start with `$`):

- `random.random(...)`
- `random.randrange(...)`
- `random.randint(...)`
- `random.choice(...)`
- `random.uniform(...)`
- `random.triangular(...)`
