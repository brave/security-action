---
name: oss/trailofbits.hcl.terraform.vault-hardcoded-token.vault-hardcoded-token
rubric: safety
severity: should_fix
languages: [hcl]
---

**Rule.** Found Terraform Vault instance with hardcoded token

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://registry.terraform.io/providers/hashicorp/vault/latest/docs#token. Ported from opengrep rule `trailofbits.hcl.terraform.vault-hardcoded-token.vault-hardcoded-token` (generated/oss/audit.yaml).

## Examples

Bad:

```text
token = "..."
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.hcl.terraform.vault-hardcoded-token.vault-hardcoded-token` (metavariables start with `$`):

- `provider "vault" { ... }`
- `token = "..."`
