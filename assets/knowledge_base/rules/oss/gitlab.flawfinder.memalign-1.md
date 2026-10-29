---
name: oss/gitlab.flawfinder.memalign-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The `memalign` function may not check that the alignment argument is correct. Calling free (on non Linux-based systems) may fail and in certain circumstances this failure may be exploitable. This function has been deprecated in favor of `posix_memalign`. For more information please see: https://linux.die.net/man/3/memalign

**Why.** Reported as CWE-676. Ported from opengrep rule `gitlab.flawfinder.memalign-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.memalign-1` (metavariables start with `$`):

- `memalign(...)`
- `(void)\s\*(\s|)(memalign)\;`
