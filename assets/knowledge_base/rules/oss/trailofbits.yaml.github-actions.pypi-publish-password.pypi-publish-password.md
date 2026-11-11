---
name: oss/trailofbits.yaml.github-actions.pypi-publish-password.pypi-publish-password
rubric: safety
severity: should_fix
languages: [yaml]
cwe: [CWE-798]
---

**Rule.** Found long-term access key. Instead prefer PyPI trusted publishing and temporary OIDC security credentials.

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://docs.pypi.org/trusted-publishers/. See https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-pypi. See https://github.com/pypa/gh-action-pypi-publish. Ported from opengrep rule `trailofbits.yaml.github-actions.pypi-publish-password.pypi-publish-password` (generated/oss/audit.yaml).

## Examples

Bad:

```text
with:
  ...
  password: ...
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.github-actions.pypi-publish-password.pypi-publish-password` (metavariables start with `$`):

- `uses: $ACTION
...`
- `^pypa/gh-action-pypi-publish`
- `with:
  ...
  password: ...`
