---
name: oss/gitlab.bandit.B306
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found creating temporary files with the insecure `mktemp` method. Depending on how the application uses this temporary file, an attacker may be able to create symlinks that point to other files prior to the application creating or writing to the target file, leading to unintended files being created or overwritten. To remediate this issue consider using `tempfile.TemporaryFile` instead. Example using `tempfile.TemporaryFile` to write a file: ``` import tempfile # Open a new temporary file using a context manager with tempfile.TemporaryFile() as fp: # Write some data to the temporary file fp.write(b'Some data') # Seek back to beginning of file fp.seek(0) # Read it data = fp.read() # File is automatically closed/removed once we exit the with context ``` For more information on alternative tempfile functions see: - https://docs.python.org/3/library/tempfile.html

**Why.** Reported as CWE-377. Ported from opengrep rule `gitlab.bandit.B306` (generated/oss/audit.yaml).

## Examples

Bad:

```python
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B306` (metavariables start with `$`):

- `tempfile.mktemp(...)`
