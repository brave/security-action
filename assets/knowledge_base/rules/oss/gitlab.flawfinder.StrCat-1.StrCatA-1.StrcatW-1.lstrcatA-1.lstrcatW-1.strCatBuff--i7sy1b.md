---
name: oss/gitlab.flawfinder.StrCat-1.StrCatA-1.StrcatW-1.lstrcatA-1.lstrcatW-1.strCatBuff--i7sy1b
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The `StrCat` family of functions do not guarantee the final string to be null terminated. Consider using one of the following alternatives: `StringCbCat`, `StringCbCatEx`, `StringCbCatN`, `StringCbCatNEx`, `StringCchCat`, `StringCchCatEx`, `StringCchCatN`, or `StringCchCatNEx`. For more information please see: https://learn.microsoft.com/en-us/windows/win32/api/strsafe/

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.StrCat-1.StrCatA-1.StrcatW-1.lstrcatA-1.lstrcatW-1.strCatBuff-1.StrCatBuffA-1.StrCatBuffW-1.StrCatChainW-1._tccat-1._mbccat-1._ftcscat-1.StrCatN-1.StrCatNA-1.StrCatNW-1.StrNCat-1.StrNCatA-1.StrNCatW-1.lstrncat-1.lstrcatnA-1.lstrcatnW-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.StrCat-1.StrCatA-1.StrcatW-1.lstrcatA-1.lstrcatW-1.strCatBuff-1.StrCatBuffA-1.StrCatBuffW-1.StrCatChainW-1._tccat-1._mbccat-1._ftcscat-1.StrCatN-1.StrCatNA-1.StrCatNW-1.StrNCat-1.StrNCatA-1.StrNCatW-1.lstrncat-1.lstrcatnA-1.lstrcatnW-1` (metavariables start with `$`):

- `strcat(...)`
- `strcatA(...)`
- `StrcatW(...)`
- `lstrcatA(...)`
- `lstrcatW(...)`
- `strCatBuff(...)`
- `StrCatBuffA(...)`
- `StrCatBuffW(...)`
- `StrCatChainW(...)`
- `_tccat(...)`
- `_mbccat(...)`
- `_ftcscat(...)`
- `StrCatN(...)`
- `StrCatNA(...)`
- `StrCatNW(...)`
- `StrNCat(...)`
- `StrNCatA(...)`
- `StrNCatW(...)`
- `lstrncat(...)`
- `lstrcatnA(...)`
- `lstrcatnW(...)`
