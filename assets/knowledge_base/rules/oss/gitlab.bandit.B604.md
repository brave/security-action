---
name: oss/gitlab.bandit.B604
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-78]
---

**Rule.** subprocess call - check for execution of untrusted input

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.bandit.B604` (generated/oss/audit.yaml).

## Examples

Bad:

```python
$FOO(..., shell=True, ...)
```

Good:

```python
subprocess.$FUNC(..., shell=True, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B604` (metavariables start with `$`):

- `subprocess.$FUNC(..., shell=True, ...)`
- `$FOO(..., shell=True, ...)`
