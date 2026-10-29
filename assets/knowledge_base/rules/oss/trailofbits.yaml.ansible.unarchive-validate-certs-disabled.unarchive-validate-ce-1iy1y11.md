---
name: oss/trailofbits.yaml.ansible.unarchive-validate-certs-disabled.unarchive-validate-ce-1iy1y11
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found unarchive download with SSL verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/unarchive_module.html#parameter-validate_certs. Ported from opengrep rule `trailofbits.yaml.ansible.unarchive-validate-certs-disabled.unarchive-validate-certs-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```text
unarchive
ansible.builtin.unarchive
$KEY: $VALUE
validate_certs
false
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.unarchive-validate-certs-disabled.unarchive-validate-certs-disabled` (metavariables start with `$`):

- `$UNARCHIVE:
  ...`
- `unarchive`
- `ansible.builtin.unarchive`
- `$KEY: $VALUE`
- `validate_certs`
- `false`
