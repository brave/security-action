---
name: oss/trailofbits.yaml.github-actions.rubygems-publish-key.rubygems-publish-key
rubric: safety
severity: should_fix
languages: [yaml]
---

**Rule.** Found long-term access key. Instead prefer RubyGems trusted publishing and temporary OIDC security credentials.

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://guides.rubygems.org/trusted-publishing/. See https://guides.rubygems.org/api-key-scopes/#usage-with-gem-cli. See https://github.com/rubygems/release-gem. Ported from opengrep rule `trailofbits.yaml.github-actions.rubygems-publish-key.rubygems-publish-key` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.yaml.github-actions.rubygems-publish-key.rubygems-publish-key` (metavariables start with `$`):

- `GEM_HOST_API_KEY`
