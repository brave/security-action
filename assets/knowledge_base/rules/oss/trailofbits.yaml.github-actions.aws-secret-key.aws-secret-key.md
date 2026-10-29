---
name: oss/trailofbits.yaml.github-actions.aws-secret-key.aws-secret-key
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found long-term access key. Instead prefer AWS role assumption and temporary OIDC security credentials.

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds.html#sec-alternatives-to-long-term-access-keys. See https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services. See https://github.com/aws-actions/configure-aws-credentials. Ported from opengrep rule `trailofbits.yaml.github-actions.aws-secret-key.aws-secret-key` (generated/oss/audit.yaml).

## Examples

Bad:

```text
with:
  ...
  aws-secret-access-key: ...
env:
  ...
  AWS_SECRET_ACCESS_KEY: ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.github-actions.aws-secret-key.aws-secret-key` (metavariables start with `$`):

- `uses: $ACTION
...`
- `^aws-actions/configure-aws-credentials`
- `with:
  ...
  aws-secret-access-key: ...`
- `env:
  ...
  AWS_SECRET_ACCESS_KEY: ...`
