---
name: oss/trailofbits.hcl.terraform.vault-skip-tls-verify.vault-skip-tls-verify
rubric: safety
severity: should_fix
languages: [hcl]
cwe: [CWE-295]
---

**Rule.** Found Terraform Vault instance with TLS verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://registry.terraform.io/providers/hashicorp/vault/latest/docs#skip_tls_verify. Ported from opengrep rule `trailofbits.hcl.terraform.vault-skip-tls-verify.vault-skip-tls-verify` (generated/oss/audit.yaml).

## Examples

Bad:

```text
skip_tls_verify = true
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.hcl.terraform.vault-skip-tls-verify.vault-skip-tls-verify` (metavariables start with `$`):

- `provider "vault" { ... }`
- `skip_tls_verify = true`
