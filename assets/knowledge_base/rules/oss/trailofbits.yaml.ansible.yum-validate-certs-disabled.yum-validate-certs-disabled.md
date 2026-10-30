---
name: oss/trailofbits.yaml.ansible.yum-validate-certs-disabled.yum-validate-certs-disabled
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-295]
---

**Rule.** Found yum with SSL verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/yum_module.html#parameter-validate_certs. Ported from opengrep rule `trailofbits.yaml.ansible.yum-validate-certs-disabled.yum-validate-certs-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```text
yum
ansible.builtin.yum
$KEY: $VALUE
validate_certs
false
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.yum-validate-certs-disabled.yum-validate-certs-disabled` (metavariables start with `$`):

- `$YUM:
  ...`
- `yum`
- `ansible.builtin.yum`
- `$KEY: $VALUE`
- `validate_certs`
- `false`
