---
name: oss/trailofbits.yaml.github-actions.jfrog-hardcoded-credential.jfrog-hardcoded-crede-got2wu
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-798]
---

**Rule.** Found long-term access key. Instead prefer JFrog temporary OIDC security credentials

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://jfrog.com/help/r/jfrog-platform-administration-documentation/openid-connect-integration. See https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-jfrog. See https://github.com/jfrog/setup-jfrog-cli#authorization. Ported from opengrep rule `trailofbits.yaml.github-actions.jfrog-hardcoded-credential.jfrog-hardcoded-credential` (generated/oss/audit.yaml).

## Examples

Bad:

```text
env:
  ...
  $VAR: ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.github-actions.jfrog-hardcoded-credential.jfrog-hardcoded-credential` (metavariables start with `$`):

- `uses: $ACTION
...`
- `^jfrog/setup-jfrog-cli`
- `env:
  ...
  $VAR: ...`
- `^(JF_PASSWORD|JF_ACCESS_TOKEN|JF_ENV_.+)$`
