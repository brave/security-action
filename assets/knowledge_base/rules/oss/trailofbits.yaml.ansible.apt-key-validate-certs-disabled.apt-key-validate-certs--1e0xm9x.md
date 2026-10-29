---
name: oss/trailofbits.yaml.ansible.apt-key-validate-certs-disabled.apt-key-validate-certs--1e0xm9x
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found apt key with SSL verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/apt_key_module.html#parameter-validate_certs. Ported from opengrep rule `trailofbits.yaml.ansible.apt-key-validate-certs-disabled.apt-key-validate-certs-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```text
apt_key
ansible.builtin.apt_key
$KEY: $VALUE
validate_certs
false
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.apt-key-validate-certs-disabled.apt-key-validate-certs-disabled` (metavariables start with `$`):

- `$APTKEY:
  ...
  url: ...
  ...`
- `apt_key`
- `ansible.builtin.apt_key`
- `$KEY: $VALUE`
- `validate_certs`
- `false`
