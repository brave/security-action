---
name: oss/gitlab.bandit.B609
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** Detected use of the wildcard character in a system call that spawns a shell. This subjects the wildcard to normal shell expansion, which can have unintended consequences if there exist any non-standard file names. For instance, a file named `-e sh script.sh` could cause issues when expanded by the shell and executed as a command. Consider using a different method to achieve the same result, such as using the `glob` module to expand the wildcard before passing it to the system call. Or if the command is static, consider hardcoding the command instead of using a wildcard. For example, the below code uses the glob module to expand the wildcard and get a list of all CSV files in the current directory. This list is then used in the subprocess.run call, instead of a wildcard. This avoids the potential issues that can arise from using a wildcard in a system call. ``` import glob import subprocess # Secure way to process all CSV files files = glob.glob('*.csv') for file in files: subprocess.run(['process_data', file]) ```

**Why.** Reported as CWE-155. Ported from opengrep rule `gitlab.bandit.B609` (generated/oss/audit.yaml).

## Examples

Bad:

```python
os.$X("$CMD", ...)
subprocess.Popen("$CMD", shell=True, ...)
```

Good:

```python
os.spawnvp(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B609` (metavariables start with `$`):

- `os.$X("$CMD", ...)`
- `subprocess.Popen("$CMD", shell=True, ...)`
- `(.*?)(\*|\?)`
- `os.spawnvp(...)`
