---
name: oss/trailofbits.yaml.ansible.apt-unencrypted-url.apt-unencrypted-url
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-319]
---

**Rule.** Found apt deb with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/apt_module.html#parameter-deb. Ported from opengrep rule `trailofbits.yaml.ansible.apt-unencrypted-url.apt-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
apt
ansible.builtin.apt
$KEY: '$VALUE'
deb
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.apt-unencrypted-url.apt-unencrypted-url` (metavariables start with `$`):

- `$APT:
  ...`
- `apt`
- `ansible.builtin.apt`
- `$KEY: '$VALUE'`
- `deb`
- `(?i)^(http|ftp)://.*`
