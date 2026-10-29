---
name: oss/gitlab.flawfinder.getwd-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** `getwd` does not contain a parameter to limit how many characters can be copied into the destination buffer. For portability and security reasons `getwd` has been deprecated in favor of `getcwd`. For more information please see: https://linux.die.net/man/3/getcwd

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.getwd-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.getwd-1` (metavariables start with `$`):

- `getwd(...)`
