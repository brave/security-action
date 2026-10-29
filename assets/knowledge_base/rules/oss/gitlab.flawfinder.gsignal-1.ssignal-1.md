---
name: oss/gitlab.flawfinder.gsignal-1.ssignal-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The `gsignal` and `ssignal` functions are obsolete and no longer recommended. Consider using the `raise` or `sigaction` functions instead for process signaling. For more information please see: https://linux.die.net/man/3/sigaction

**Why.** Reported as CWE-676. Ported from opengrep rule `gitlab.flawfinder.gsignal-1.ssignal-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.gsignal-1.ssignal-1` (metavariables start with `$`):

- `gsignal(...)`
- `ssignal(...)`
