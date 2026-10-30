---
name: oss/gitlab.flawfinder.lstrcpy-1.wcscpy-1.-tcscpy-1.-mbscpy-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The `lstrcpy` family of functions do not provide the ability to limit or check buffer sizes before copying to a destination buffer. This can lead to buffer overflows. Consider using more secure alternatives such as `strncpy_s`. If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strncpy-s-strncpy-s-l-wcsncpy-s-wcsncpy-s-l-mbsncpy-s-mbsncpy-s-l?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.lstrcpy-1.wcscpy-1._tcscpy-1._mbscpy-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.lstrcpy-1.wcscpy-1._tcscpy-1._mbscpy-1` (metavariables start with `$`):

- `lstrcpy(...)`
- `wcscpy(...)`
- `_tcscpy(...)`
- `_mbscpy(...)`
