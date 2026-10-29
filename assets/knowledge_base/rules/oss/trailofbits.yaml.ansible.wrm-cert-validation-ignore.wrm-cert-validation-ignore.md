---
name: oss/trailofbits.yaml.ansible.wrm-cert-validation-ignore.wrm-cert-validation-ignore
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found Windows Remote Management connection with certificate validation disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://docs.ansible.com/ansible/latest/os_guide/windows_winrm.html#https-certificate-validation. Ported from opengrep rule `trailofbits.yaml.ansible.wrm-cert-validation-ignore.wrm-cert-validation-ignore` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.ansible.wrm-cert-validation-ignore.wrm-cert-validation-ignore` (metavariables start with `$`):

- `ansible_winrm_server_cert_validation: ignore`
