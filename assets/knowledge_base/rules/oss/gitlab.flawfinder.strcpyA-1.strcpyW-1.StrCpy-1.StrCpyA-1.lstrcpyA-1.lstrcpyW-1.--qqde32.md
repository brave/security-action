---
name: oss/gitlab.flawfinder.strcpyA-1.strcpyW-1.StrCpy-1.StrCpyA-1.lstrcpyA-1.lstrcpyW-1.--qqde32
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The `StrCpy` family of functions do not guarantee the final string to be null terminated. Consider using one of the following alternatives `StringCbCopy`, `StringCbCopyEx`, `StringCbCopyN`, `StringCbCopyNEx`, `StringCchCopy`, `StringCchCopyEx`, `StringCchCopyN`, or `StringCchCopyNEx`. If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strncpy-s-strncpy-s-l-wcsncpy-s-wcsncpy-s-l-mbsncpy-s-mbsncpy-s-l?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.strcpyA-1.strcpyW-1.StrCpy-1.StrCpyA-1.lstrcpyA-1.lstrcpyW-1._tccpy-1._mbccpy-1._ftcscpy-1._mbsncpy-1.StrCpyN-1.StrCpyNA-1.StrCpyNW-1.StrNCpy-1.strcpynA-1.StrNCpyA-1.StrNCpyW-1.lstrcpynA-1.lstrcpynW-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.strcpyA-1.strcpyW-1.StrCpy-1.StrCpyA-1.lstrcpyA-1.lstrcpyW-1._tccpy-1._mbccpy-1._ftcscpy-1._mbsncpy-1.StrCpyN-1.StrCpyNA-1.StrCpyNW-1.StrNCpy-1.strcpynA-1.StrNCpyA-1.StrNCpyW-1.lstrcpynA-1.lstrcpynW-1` (metavariables start with `$`):

- `strcpyA(...)`
- `strcpyW(...)`
- `StrCpy(...)`
- `StrCpyA(...)`
- `lstrcpyA(...)`
- `lstrcpyW(...)`
- `_tccpy(...)`
- `_mbccpy(...)`
- `_ftcscpy(...)`
- `_mbsncpy(...)`
- `StrCpyN(...)`
- `StrCpyNA(...)`
- `StrCpyNW(...)`
- `StrNCpy(...)`
- `strcpynA(...)`
- `StrNCpyA(...)`
- `StrNCpyW(...)`
- `lstrcpynA(...)`
- `lstrcpynW(...)`
