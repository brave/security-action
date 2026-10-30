---
name: client/license-nonfree
rubric: safety
severity: should_fix
languages: [regex]
---

**Rule.** Non-free license detected

**Why.** Ported from opengrep rule `license-nonfree` (client/licensing.yaml).

## Examples

Bad:

```text
(NonCommercial|NoDerivs|BY-NC|BY-ND)
```

## Detection hints

Literal patterns from opengrep rule `license-nonfree` (metavariables start with `$`):

- `(NonCommercial|NoDerivs|BY-NC|BY-ND)`
