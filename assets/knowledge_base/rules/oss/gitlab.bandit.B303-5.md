---
name: oss/gitlab.bandit.B303-5
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-327]
---

**Rule.** Detected MD5 hash algorithm which is considered insecure. MD5 is not collision resistant and is therefore not suitable as a cryptographic signature. Use SHA256 or SHA3 instead.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.bandit.B303-5` (generated/oss/audit.yaml).

## Examples

Bad:

```python
Crypto.Hash.MD5.new(...)
Cryptodome.Hash.MD5.new (...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B303-5` (metavariables start with `$`):

- `Crypto.Hash.MD5.new(...)`
- `Cryptodome.Hash.MD5.new (...)`
