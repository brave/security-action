---
name: oss/trailofbits.yaml.ansible.apt-key-unencrypted-url.apt-key-unencrypted-url
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-319]
---

**Rule.** Found apt key download with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/apt_key_module.html#parameter-url. Ported from opengrep rule `trailofbits.yaml.ansible.apt-key-unencrypted-url.apt-key-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
apt_key
ansible.builtin.apt_key
$KEY: '$VALUE'
url
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.apt-key-unencrypted-url.apt-key-unencrypted-url` (metavariables start with `$`):

- `$APTKEY:
  ...`
- `apt_key`
- `ansible.builtin.apt_key`
- `$KEY: '$VALUE'`
- `url`
- `(?i)^(http|ftp)://.*`
