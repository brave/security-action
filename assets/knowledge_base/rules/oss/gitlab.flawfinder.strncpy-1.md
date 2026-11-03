---
name: oss/gitlab.flawfinder.strncpy-1
rubric: safety
severity: nit
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The `strncpy` family of functions do not properly handle strings that are not null terminated. It is recommended to use more secure alternatives such as `snprintf`. For more information please see: https://linux.die.net/man/3/snprintf If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strncpy-s-strncpy-s-l-wcsncpy-s-wcsncpy-s-l-mbsncpy-s-mbsncpy-s-l?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.strncpy-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.strncpy-1` (metavariables start with `$`):

- `strncpy(...)`
