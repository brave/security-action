---
name: oss/gitlab.bandit.B607
rubric: safety
severity: nit
languages: [python]
cwe: [CWE-78]
---

**Rule.** Starting a process with a shell; seems safe, but may be changed in the future, consider rewriting without shell

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.bandit.B607` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B607` (metavariables start with `$`):

- `os.system("...", ...)`
- `$OS.popen("...", ...)`
- `$OS.popen2("...", ...)`
- `$OS.popen3("...", ...)`
- `$OS.popen4("...", ...)`
- `commands.getoutput("...", ...)`
- `commands.getstatusoutput("...", ...)`
