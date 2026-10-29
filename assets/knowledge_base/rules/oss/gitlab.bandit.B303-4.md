---
name: oss/gitlab.bandit.B303-4
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Detected MD4 hash algorithm which is considered insecure. This algorithm has many known vulnerabilities and has been deprecated. Use SHA256 or SHA3 instead.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.bandit.B303-4` (generated/oss/audit.yaml).

## Examples

Bad:

```python
Crypto.Hash.MD4.new(...)
Cryptodome.Hash.MD4.new (...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B303-4` (metavariables start with `$`):

- `Crypto.Hash.MD4.new(...)`
- `Cryptodome.Hash.MD4.new (...)`
