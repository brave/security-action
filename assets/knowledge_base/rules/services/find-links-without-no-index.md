---
name: services/find-links-without-no-index
rubric: safety
severity: nit
languages: [generic]
---

**Rule.** When --find-links or -f is used without --no-index, pip may try to install the package from PyPI. Add --no-index to avoid dependency confusion.

**Why.** See https://portswigger.net/daily-swig/dependency-confusion-attack-mounted-via-pypi-repo-exposes-flawed-package-installer-behavior. See https://www.bleepingcomputer.com/news/security/pytorch-discloses-malicious-dependency-chain-compromise-over-holidays/. Ported from opengrep rule `find-links-without-no-index` (services/find-links-without-no-index.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `find-links-without-no-index` (metavariables start with `$`):

- `^(?!.*--no-index).*--find-links`
- `^(?!.*--no-index).*(pip|pip3)\s.*\s-f`
