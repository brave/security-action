---
name: oss/gitlab.bandit.B404
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-78]
---

**Rule.** Consider possible security implications associated with subprocess module.

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.bandit.B404` (generated/oss/audit.yaml).

## Examples

Bad:

```python
import subprocess
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B404` (metavariables start with `$`):

- `import subprocess`
