---
name: oss/trailofbits.yaml.ansible.yum-unencrypted-url.yum-unencrypted-url
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-319]
---

**Rule.** Found yum download with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/yum_module.html#parameter-name. Ported from opengrep rule `trailofbits.yaml.ansible.yum-unencrypted-url.yum-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
yum
ansible.builtin.yum
$KEY: '$VALUE'
name
pkg
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.yum-unencrypted-url.yum-unencrypted-url` (metavariables start with `$`):

- `$YUM:
  ...`
- `yum`
- `ansible.builtin.yum`
- `$KEY: '$VALUE'`
- `name`
- `pkg`
- `(?i)^(http|ftp)://.*`
