---
name: oss/trailofbits.yaml.ansible.unarchive-unencrypted-url.unarchive-unencrypted-url
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found unarchive download with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/unarchive_module.html#parameter-src. Ported from opengrep rule `trailofbits.yaml.ansible.unarchive-unencrypted-url.unarchive-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
unarchive
ansible.builtin.unarchive
$KEY: '$VALUE'
src
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.unarchive-unencrypted-url.unarchive-unencrypted-url` (metavariables start with `$`):

- `$UNARCHIVE:
  ...`
- `unarchive`
- `ansible.builtin.unarchive`
- `$KEY: '$VALUE'`
- `src`
- `(?i)^(http|ftp)://.*`
