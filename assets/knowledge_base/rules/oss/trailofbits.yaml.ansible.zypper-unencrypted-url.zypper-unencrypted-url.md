---
name: oss/trailofbits.yaml.ansible.zypper-unencrypted-url.zypper-unencrypted-url
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found Zypper package with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/community/general/zypper_module.html#parameter-name. Ported from opengrep rule `trailofbits.yaml.ansible.zypper-unencrypted-url.zypper-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$KEY: '$VALUE'
name
pkg
zypper
community.general.zypper
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.zypper-unencrypted-url.zypper-unencrypted-url` (metavariables start with `$`):

- `$ZYPPER:
  ...`
- `$KEY: '$VALUE'`
- `name`
- `pkg`
- `zypper`
- `community.general.zypper`
- `(?i)^(http|ftp)://.*`
