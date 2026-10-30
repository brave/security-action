---
name: oss/gitlab.bandit.B303-6
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-327]
---

**Rule.** Detected SHA1 hash algorithm which is considered insecure. SHA1 is not collision resistant and is therefore not suitable as a cryptographic signature. Use SHA256 or SHA3 instead.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.bandit.B303-6` (generated/oss/audit.yaml).

## Examples

Bad:

```python
Crypto.Hash.SHA.new(...)
Cryptodome.Hash.SHA.new (...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B303-6` (metavariables start with `$`):

- `Crypto.Hash.SHA.new(...)`
- `Cryptodome.Hash.SHA.new (...)`
