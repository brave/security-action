---
name: oss/gitlab.flawfinder.lstrcatn-1.wcsncat-1.-tcsncat-1.-mbsnbcat-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** Consider using more secure alternatives such as `snprintf`, instead of the `wcsncat` family of functions. If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strncat-strncat-l-wcsncat-wcsncat-l-mbsncat-mbsncat-l?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.lstrcatn-1.wcsncat-1._tcsncat-1._mbsnbcat-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.lstrcatn-1.wcsncat-1._tcsncat-1._mbsnbcat-1` (metavariables start with `$`):

- `lstrcatn(...)`
- `wcsncat(...)`
- `_tcsncat(...)`
- `_mbsnbcat(...)`
