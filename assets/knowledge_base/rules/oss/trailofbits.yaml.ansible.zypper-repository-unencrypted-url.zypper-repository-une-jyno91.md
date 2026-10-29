---
name: oss/trailofbits.yaml.ansible.zypper-repository-unencrypted-url.zypper-repository-une-jyno91
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found Zypper repository with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/community/general/zypper_module.html#parameter-name. Ported from opengrep rule `trailofbits.yaml.ansible.zypper-repository-unencrypted-url.zypper-repository-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$KEY: '$VALUE'
repo
zypper_repository
community.general.zypper_repository
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.zypper-repository-unencrypted-url.zypper-repository-unencrypted-url` (metavariables start with `$`):

- `$ZYPPER:
  ...`
- `$KEY: '$VALUE'`
- `repo`
- `zypper_repository`
- `community.general.zypper_repository`
- `(?i)^(http|ftp)://.*`
