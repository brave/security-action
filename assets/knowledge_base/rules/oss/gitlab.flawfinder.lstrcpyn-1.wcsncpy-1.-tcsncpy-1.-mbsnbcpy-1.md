---
name: oss/gitlab.flawfinder.lstrcpyn-1.wcsncpy-1.-tcsncpy-1.-mbsnbcpy-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The `lstrcpyn` family of functions do not always check for invalid pointers or check if there is sufficient space prior to copying. The count argument limits the number of characters copied but does validate if the count will fit within the size of the destination buffer, leading to potential overflows. If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strncpy-s-strncpy-s-l-wcsncpy-s-wcsncpy-s-l-mbsncpy-s-mbsncpy-s-l?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.lstrcpyn-1.wcsncpy-1._tcsncpy-1._mbsnbcpy-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.lstrcpyn-1.wcsncpy-1._tcsncpy-1._mbsnbcpy-1` (metavariables start with `$`):

- `lstrcpyn(...)`
- `wcsncpy(...)`
- `_tcsncpy(...)`
- `_mbsnbcpy(...)`
