---
name: client/get-visible-entry
rubric: safety
severity: nit
languages: [cpp]
cwe: [CWE-346]
---

**Rule.** $FUNC usages should be vet by the security-team. Most of the time you want the last committed entry/url

**Why.** Reported as CWE-346: Origin Validation Error. See https://github.com/brave/brave-browser/wiki/Security-reviews. Ported from opengrep rule `get-visible-entry` (client/get-visible-entry.yaml).

## Examples

Bad:

```cpp
$OBJ.$FUNC(...)
```

## Detection hints

Literal patterns from opengrep rule `get-visible-entry` (metavariables start with `$`):

- `$OBJ.$FUNC(...)`
- `^(GetVisibleEntry|GetVisibleURL)$`
