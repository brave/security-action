---
name: oss/trailofbits.yaml.github-actions.azure-principal-secret.azure-principal-secret
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-798]
---

**Rule.** Found long-term access key. Instead prefer Azure subscription ID and temporary OIDC security credentials.

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure. See https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure. See https://github.com/Azure/login. Ported from opengrep rule `trailofbits.yaml.github-actions.azure-principal-secret.azure-principal-secret` (generated/oss/audit.yaml).

## Examples

Bad:

```text
with:
  ...
  creds: ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.github-actions.azure-principal-secret.azure-principal-secret` (metavariables start with `$`):

- `uses: $ACTION
...`
- `^azure/login`
- `with:
  ...
  creds: ...`
