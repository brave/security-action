---
name: oss/trailofbits.yaml.github-actions.gcp-credentials-json.gcp-credentials-json
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found long-term access key. Instead prefer GCP workload identity federation and temporary OIDC security credentials.

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://cloud.google.com/blog/products/identity-security/enabling-keyless-authentication-from-github-actions. See https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-google-cloud-platform. See https://github.com/google-github-actions/auth. Ported from opengrep rule `trailofbits.yaml.github-actions.gcp-credentials-json.gcp-credentials-json` (generated/oss/audit.yaml).

## Examples

Bad:

```text
with:
  ...
  credentials_json: ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.github-actions.gcp-credentials-json.gcp-credentials-json` (metavariables start with `$`):

- `uses: $ACTION
...`
- `^google-github-actions/auth`
- `with:
  ...
  credentials_json: ...`
