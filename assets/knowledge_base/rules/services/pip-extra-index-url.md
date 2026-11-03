---
name: services/pip-extra-index-url
rubric: safety
severity: nit
languages: [generic]
---

**Rule.** Use --index-url instead of --extra-index-url to avoid dependency confusion. When using --extra-index-url, pip looks on pypi.org as well as the private index. It may install a malicious package from pypi.org with the same name as your private package instead of the package in your private index.

**Why.** See https://portswigger.net/daily-swig/dependency-confusion-attack-mounted-via-pypi-repo-exposes-flawed-package-installer-behavior. See https://www.bleepingcomputer.com/news/security/pytorch-discloses-malicious-dependency-chain-compromise-over-holidays/. Ported from opengrep rule `pip-extra-index-url` (services/pip-extra-index-url.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `pip-extra-index-url` (metavariables start with `$`):

- `--extra-index-url`
