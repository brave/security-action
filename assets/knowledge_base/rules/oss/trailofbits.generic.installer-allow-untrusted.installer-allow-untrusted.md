---
name: oss/trailofbits.generic.installer-allow-untrusted.installer-allow-untrusted
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found `installer` command allowing untrusted installations

**Why.** Reported as CWE-494: Download of Code Without Integrity Check. See https://ss64.com/mac/installer.html. Ported from opengrep rule `trailofbits.generic.installer-allow-untrusted.installer-allow-untrusted` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.installer-allow-untrusted.installer-allow-untrusted` (metavariables start with `$`):

- `installer ... -allowUntrusted`
