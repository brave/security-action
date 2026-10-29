---
name: oss/trailofbits.yaml.github-actions.vault-token.vault-token
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found long-term access key. Instead prefer Vault role assumption and temporary OIDC security credentials.

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://developer.hashicorp.com/vault/docs/platform/github-actions. See https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-hashicorp-vault. See https://github.com/hashicorp/vault-action. Ported from opengrep rule `trailofbits.yaml.github-actions.vault-token.vault-token` (generated/oss/audit.yaml).

## Examples

Bad:

```text
with:
  ...
  token: ...
env:
  ...
  VAULT_TOKEN: ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.github-actions.vault-token.vault-token` (metavariables start with `$`):

- `uses: $ACTION
...`
- `^hashicorp/vault-action`
- `with:
  ...
  token: ...`
- `env:
  ...
  VAULT_TOKEN: ...`
