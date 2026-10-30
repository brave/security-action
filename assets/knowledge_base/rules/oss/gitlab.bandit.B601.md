---
name: oss/gitlab.bandit.B601
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-78]
---

**Rule.** Unverified SSL context detected. This will permit insecure connections without `verifyingSSL` certificates. Use `ssl.create_default_context()` instead.

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.bandit.B601` (generated/oss/audit.yaml).

## Examples

Bad:

```python
$CLIENT.exec_command(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B601` (metavariables start with `$`):

- `import paramiko
...`
- `$CLIENT.exec_command(...)`
