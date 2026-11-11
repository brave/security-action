---
name: oss/trailofbits.yaml.ansible.rpm-key-validate-certs-disabled.rpm-key-validate-certs--vmork5
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-295]
---

**Rule.** Found RPM key with SSL verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/rpm_key_module.html#parameter-validate_certs. Ported from opengrep rule `trailofbits.yaml.ansible.rpm-key-validate-certs-disabled.rpm-key-validate-certs-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```text
rpm_key
ansible.builtin.rpm_key
$KEY: $VALUE
validate_certs
false
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.rpm-key-validate-certs-disabled.rpm-key-validate-certs-disabled` (metavariables start with `$`):

- `$RPMKEY:
  ...
  key: ...
  ...`
- `rpm_key`
- `ansible.builtin.rpm_key`
- `$KEY: $VALUE`
- `validate_certs`
- `false`
