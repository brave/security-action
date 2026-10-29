---
name: oss/gitlab.bandit.B303-3
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Detected MD2 hash algorithm which is considered insecure. This algorithm has many known vulnerabilities and has been deprecated. Use SHA256 or SHA3 instead.

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.bandit.B303-3` (generated/oss/audit.yaml).

## Examples

Bad:

```python
Crypto.Hash.MD2.new(...)
Cryptodome.Hash.MD2.new (...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B303-3` (metavariables start with `$`):

- `Crypto.Hash.MD2.new(...)`
- `Cryptodome.Hash.MD2.new (...)`
