---
name: oss/trailofbits.yaml.ansible.rpm-key-unencrypted-url.rpm-key-unencrypted-url
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found RPM key download with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/rpm_key_module.html#parameter-key. Ported from opengrep rule `trailofbits.yaml.ansible.rpm-key-unencrypted-url.rpm-key-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
rpm_key
ansible.builtin.rpm_key
$KEY: '$VALUE'
key
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.rpm-key-unencrypted-url.rpm-key-unencrypted-url` (metavariables start with `$`):

- `$RPMKEY:
  ...`
- `rpm_key`
- `ansible.builtin.rpm_key`
- `$KEY: '$VALUE'`
- `key`
- `(?i)^(http|ftp)://.*`
