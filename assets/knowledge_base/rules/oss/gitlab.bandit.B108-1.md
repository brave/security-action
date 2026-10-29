---
name: oss/gitlab.bandit.B108-1
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-377]
---

**Rule.** Detected hardcoded temp directory. Consider using 'tempfile.TemporaryFile' instead.

**Why.** Reported as CWE-377: Insecure Temporary File. Ported from opengrep rule `gitlab.bandit.B108-1` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B108-1` (metavariables start with `$`):

- `open("=~/^\/tmp.*/", ...)`
