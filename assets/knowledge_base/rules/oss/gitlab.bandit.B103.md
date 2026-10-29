---
name: oss/gitlab.bandit.B103
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found setting file permissions to overly permissive values. Consider using the following values if the application user is the only process to access the file: - 0400 - read only access to the file - 0200 - write only access to the file - 0600 - read/write access to the file Example creating a file with read/write permissions for the application user: ``` # Use octal values to set 0o600 (read/write access to the file) for the current # user os.chmod('somefile.txt', 0o600) ``` For all other values please see: https://en.wikipedia.org/wiki/File-system_permissions#Numeric_notation

**Why.** Reported as CWE-732. Ported from opengrep rule `gitlab.bandit.B103` (generated/oss/audit.yaml).

## Examples

Bad:

```python
os.chmod(...,$MASK)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B103` (metavariables start with `$`):

- `os.chmod(...,$MASK)`
- `(0x..f|0o..[2,3,7]|stat.S_IXGRP|stat.S_IWOTH)`
