---
name: services/svelte-purifyConfig-usages
rubric: safety
severity: nit
languages: [generic]
---

**Rule.** The code contains new security hotspots (`purifyConfig`) which should be checked manually by a security team member!

**Why.** Reported as CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'). See https://cwe.mitre.org/data/definitions/546. See https://cwe.mitre.org/data/definitions/615. See https://btlr.dev/blog/how-to-find-vulnerabilities-in-code-bad-words. Ported from opengrep rule `svelte-purifyConfig-usages` (services/svelte-purifyConfig-usage.yaml).

## Examples

Bad:

```text
purifyConfig\([^)]+\)
```

## Detection hints

Literal patterns from opengrep rule `svelte-purifyConfig-usages` (metavariables start with `$`):

- `purifyConfig\([^)]+\)`
