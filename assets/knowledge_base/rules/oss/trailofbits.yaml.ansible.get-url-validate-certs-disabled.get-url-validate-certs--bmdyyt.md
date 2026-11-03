---
name: oss/trailofbits.yaml.ansible.get-url-validate-certs-disabled.get-url-validate-certs--bmdyyt
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-295]
---

**Rule.** Found file download with SSL verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/get_url_module.html#parameter-validate_certs. See https://docs.ansible.com/ansible/latest/collections/ansible/windows/win_get_url_module.html#parameter-validate_certs. Ported from opengrep rule `trailofbits.yaml.ansible.get-url-validate-certs-disabled.get-url-validate-certs-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```text
get_url
win_get_url
ansible.builtin.get_url
ansible.windows.win_get_url
$KEY: $VALUE
validate_certs
false
```

Good:

```text
$GETURL:
  ...
  checksum: ...
  ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.get-url-validate-certs-disabled.get-url-validate-certs-disabled` (metavariables start with `$`):

- `$GETURL:
  ...
  url: ...
  ...`
- `$GETURL:
  ...
  checksum: ...
  ...`
- `get_url`
- `win_get_url`
- `ansible.builtin.get_url`
- `ansible.windows.win_get_url`
- `$KEY: $VALUE`
- `validate_certs`
- `false`
