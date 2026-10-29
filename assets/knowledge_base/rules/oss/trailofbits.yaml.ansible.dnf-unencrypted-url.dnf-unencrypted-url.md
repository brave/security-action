---
name: oss/trailofbits.yaml.ansible.dnf-unencrypted-url.dnf-unencrypted-url
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found dnf download with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/dnf_module.html#parameter-name. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/dnf5_module.html#parameter-name. Ported from opengrep rule `trailofbits.yaml.ansible.dnf-unencrypted-url.dnf-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
dnf
ansible.builtin.dnf
dnf5
ansible.builtin.dnf5
$KEY: '$VALUE'
name
pkg
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.dnf-unencrypted-url.dnf-unencrypted-url` (metavariables start with `$`):

- `$DNF:
  ...`
- `dnf`
- `ansible.builtin.dnf`
- `dnf5`
- `ansible.builtin.dnf5`
- `$KEY: '$VALUE'`
- `name`
- `pkg`
- `(?i)^(http|ftp)://.*`
