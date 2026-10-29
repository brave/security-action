---
name: oss/gitlab.bandit.B605
rubric: safety
severity: nit
languages: [python]
cwe: [CWE-78]
---

**Rule.** Starting a process with a shell; seems safe, but may be changed in the future, consider rewriting without shell

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.bandit.B605` (generated/oss/audit.yaml).

## Examples

Bad:

```python
os.system(...)
os.popen(...)
os.popen2(...)
os.popen3(...)
os.popen4(...)
popen2.popen2(...)
popen2.popen3(...)
popen2.popen4(...)
popen2.Popen3(...)
popen2.Popen4(...)
commands.getoutput(...)
commands.getstatusoutput("")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B605` (metavariables start with `$`):

- `os.system(...)`
- `os.popen(...)`
- `os.popen2(...)`
- `os.popen3(...)`
- `os.popen4(...)`
- `popen2.popen2(...)`
- `popen2.popen3(...)`
- `popen2.popen4(...)`
- `popen2.Popen3(...)`
- `popen2.Popen4(...)`
- `commands.getoutput(...)`
- `commands.getstatusoutput("")`
