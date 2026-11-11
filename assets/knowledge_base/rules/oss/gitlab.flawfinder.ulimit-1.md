---
name: oss/gitlab.flawfinder.ulimit-1
rubric: safety
severity: nit
languages: [c, cpp]
cwe: [CWE-676]
---

**Rule.** The ulimit function is obsolete and no longer recommended. Use `getrlimit(2)`, `setrlimit`, or `sysconf` instead. For more information please see: https://linux.die.net/man/3/setrlimit

**Why.** Reported as CWE-676. Ported from opengrep rule `gitlab.flawfinder.ulimit-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.ulimit-1` (metavariables start with `$`):

- `ulimit(...)`
