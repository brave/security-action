---
name: oss/trailofbits.yaml.ansible.dnf-validate-certs-disabled.dnf-validate-certs-disabled
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found dnf with SSL verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/dnf_module.html#parameter-validate_certs. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/dnf5_module.html#parameter-validate_certs. Ported from opengrep rule `trailofbits.yaml.ansible.dnf-validate-certs-disabled.dnf-validate-certs-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```text
dnf
ansible.builtin.dnf
dnf5
ansible.builtin.dnf5
$KEY: $VALUE
validate_certs
false
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.dnf-validate-certs-disabled.dnf-validate-certs-disabled` (metavariables start with `$`):

- `$DNF:
  ...`
- `dnf`
- `ansible.builtin.dnf`
- `dnf5`
- `ansible.builtin.dnf5`
- `$KEY: $VALUE`
- `validate_certs`
- `false`
