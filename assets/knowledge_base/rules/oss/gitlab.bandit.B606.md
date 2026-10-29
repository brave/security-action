---
name: oss/gitlab.bandit.B606
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Found dynamic content when spawning a process. This is dangerous if externaldata can reach this function call because it allows a malicious actor toexecute commands. Ensure no external data reaches here.

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.bandit.B606` (generated/oss/audit.yaml).

## Examples

Bad:

```python
os.execl(...)
os.execle(...)
os.execlp(...)
os.execlpe(...)
os.execv(...)
os.execve(...)
os.execvp(...)
os.execvpe(...)
os.startfile(...)
os.spawnl(...)
os.spawnle(...)
os.spawnlp(...)
os.spawnlpe(...)
os.spawnv(...)
os.spawnve(...)
os.spawnvp(...)
os.spawnvpe(...)
```

Good:

```python
os.$W("...", ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B606` (metavariables start with `$`):

- `os.$W("...", ...)`
- `os.execl(...)`
- `os.execle(...)`
- `os.execlp(...)`
- `os.execlpe(...)`
- `os.execv(...)`
- `os.execve(...)`
- `os.execvp(...)`
- `os.execvpe(...)`
- `os.startfile(...)`
- `os.spawnl(...)`
- `os.spawnle(...)`
- `os.spawnlp(...)`
- `os.spawnlpe(...)`
- `os.spawnv(...)`
- `os.spawnve(...)`
- `os.spawnvp(...)`
- `os.spawnvpe(...)`
