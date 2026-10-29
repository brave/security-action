---
name: oss/trailofbits.yaml.ansible.get-url-unencrypted-url.get-url-unencrypted-url
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found file download with unencrypted URL (e.g. HTTP, FTP, etc.)

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/get_url_module.html#parameter-url. See https://docs.ansible.com/ansible/latest/collections/ansible/windows/win_get_url_module.html#parameter-url. Ported from opengrep rule `trailofbits.yaml.ansible.get-url-unencrypted-url.get-url-unencrypted-url` (generated/oss/audit.yaml).

## Examples

Bad:

```text
get_url
win_get_url
ansible.builtin.get_url
ansible.windows.win_get_url
$KEY: '$VALUE'
url
```

Good:

```text
$GETURL:
  ...
  checksum: ...
  ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.get-url-unencrypted-url.get-url-unencrypted-url` (metavariables start with `$`):

- `$GETURL:
  ...`
- `$GETURL:
  ...
  checksum: ...
  ...`
- `get_url`
- `win_get_url`
- `ansible.builtin.get_url`
- `ansible.windows.win_get_url`
- `$KEY: '$VALUE'`
- `url`
- `(?i)^(http|ftp)://.*`
