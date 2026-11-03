---
name: oss/gitlab.flawfinder.strncat-1
rubric: safety
severity: nit
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The `strncat` family of functions are easy to use incorrectly when calculating destination buffer sizes. It is recommended to use more secure alternatives such as `snprintf`. For more information please see: https://linux.die.net/man/3/snprintf If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strncat-s-strncat-s-l-wcsncat-s-wcsncat-s-l-mbsncat-s-mbsncat-s-l?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.strncat-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.strncat-1` (metavariables start with `$`):

- `strncat(...)`
