---
name: oss/gitlab.flawfinder.lstrcat-1.wcscat-1.-tcscat-1.-mbscat-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The `strcat` family of functions are unable to limit how many bytes are copied to the destination buffer. It is recommended to use more secure alternatives such as `snprintf`. If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strcat-s-wcscat-s-mbscat-s?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.lstrcat-1.wcscat-1._tcscat-1._mbscat-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.lstrcat-1.wcscat-1._tcscat-1._mbscat-1` (metavariables start with `$`):

- `lstrcat(...)`
- `wcscat(...)`
- `_tcscat(...)`
- `_mbscat(...)`
