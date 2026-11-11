---
name: oss/gitlab.flawfinder.AddAccessAllowedAce-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-732]
---

**Rule.** Make sure that you set inheritance by hand if you wish it to inherit.

**Why.** Reported as CWE-732. Ported from opengrep rule `gitlab.flawfinder.AddAccessAllowedAce-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.AddAccessAllowedAce-1` (metavariables start with `$`):

- `AddAccessAllowedAce(...)`
