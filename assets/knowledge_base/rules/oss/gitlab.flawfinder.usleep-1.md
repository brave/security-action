---
name: oss/gitlab.flawfinder.usleep-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The `usleep` function has been deprecated, use `nanosleep` or `setitimer` instead. For more information please see: https://linux.die.net/man/3/setitimer

**Why.** Reported as CWE-676. Ported from opengrep rule `gitlab.flawfinder.usleep-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.usleep-1` (metavariables start with `$`):

- `usleep(...)`
