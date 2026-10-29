---
name: oss/gitlab.bandit.B603
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-78]
---

**Rule.** Python possesses many mechanisms to invoke an external executable. However, doing so may present a security issue if appropriate care is not taken to sanitize any user provided or variable input. This plugin test is part of a family of tests built to check for process spawning and warn appropriately. Specifically, this test looks for the spawning of a subprocess without the use of a command shell. This type of subprocess invocation is not vulnerable to shell injection attacks, but care should still be taken to ensure validity of input.

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.bandit.B603` (generated/oss/audit.yaml).

## Examples

Bad:

```python
subprocess.$FUNC($ARG, shell=False)
subprocess.$FUNC($ARG, shell=0)
subprocess.$FUNC($ARG, shell={...})
subprocess.$FUNC($ARG, shell=[...])
subprocess.$FUNC($ARG)
```

Good:

```python
subprocess.$FUNC($ARG, shell=<... True ...>)
subprocess.$FUNC($ARG, shell=<... 'True' ...>)
subprocess.$FUNC($ARG, shell=<... "True" ...>)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B603` (metavariables start with `$`):

- `subprocess.$FUNC($ARG, shell=<... True ...>)`
- `subprocess.$FUNC($ARG, shell=<... 'True' ...>)`
- `subprocess.$FUNC($ARG, shell=<... "True" ...>)`
- `subprocess.$FUNC($ARG, shell=False)`
- `subprocess.$FUNC($ARG, shell=0)`
- `subprocess.$FUNC($ARG, shell={...})`
- `subprocess.$FUNC($ARG, shell=[...])`
- `subprocess.$FUNC($ARG)`
