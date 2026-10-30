---
name: oss/gitlab.bandit.B602
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-78]
---

**Rule.** Found `subprocess` function `$FUNC` with `shell=True`. This is dangerous because this call will spawn the command using a shell process. Doing so propagates current shell settings and variables, which makes it much easier for a malicious actor to execute commands. Use `shell=False` instead.

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.bandit.B602` (generated/oss/audit.yaml).

## Examples

Bad:

```python
subprocess.$FUNC($ARG, ...)
subprocess.$FUNC(..., shell=True, ...)
subprocess.$FUNC(..., shell=[$V, ...], ...)
subprocess.$FUNC(..., shell={$K: $V, ...}, ...)
subprocess.$FUNC(..., shell=$INTVAL, ...)
subprocess.$FUNC(..., shell='$STRVAL', ...)
```

Good:

```python
...
$ARG = '...'.format('...')
...
subprocess.$FUNC('...', ...)
subprocess.$FUNC('...' % '...', ...)
subprocess.$FUNC('...'.format('...'), ...)
subprocess.$FUNC(..., shell=0, ...)
subprocess.$FUNC(..., shell='', ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B602` (metavariables start with `$`):

- `...
$ARG = '...'.format('...')
...`
- `subprocess.$FUNC($ARG, ...)`
- `subprocess.$FUNC('...', ...)`
- `subprocess.$FUNC('...' % '...', ...)`
- `subprocess.$FUNC('...'.format('...'), ...)`
- `subprocess.$FUNC(..., shell=True, ...)`
- `subprocess.$FUNC(..., shell=[$V, ...], ...)`
- `subprocess.$FUNC(..., shell={$K: $V, ...}, ...)`
- `subprocess.$FUNC(..., shell=$INTVAL, ...)`
- `subprocess.$FUNC(..., shell=0, ...)`
- `^[0-9]+$`
- `subprocess.$FUNC(..., shell='$STRVAL', ...)`
- `subprocess.$FUNC(..., shell='', ...)`
