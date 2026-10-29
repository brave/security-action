---
name: oss/gitlab.flawfinder.scanf-1.vscanf-1.wscanf-1.-tscanf-1.vwscanf-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Format specifiers can take optional field widths, which should be used to limit how many characters are copied into the target buffer. For more information please see: https://linux.die.net/man/3/scanf Example: ``` char buf[11] = {0}; scanf("%10s", &buf); // buf = AAAAAAAAAA\0 ``` If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/scanf-s-scanf-s-l-wscanf-s-wscanf-s-l?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.scanf-1.vscanf-1.wscanf-1._tscanf-1.vwscanf-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.scanf-1.vscanf-1.wscanf-1._tscanf-1.vwscanf-1` (metavariables start with `$`):

- `scanf($FMT, ...)`
- `scanf("...", ...)`
- `vscanf($FMT, ...)`
- `vscanf("...", ...)`
- `wscanf($FMT, ...)`
- `wscanf("...", ...)`
- `_tscanf($FMT, ...)`
- `_tscanf(_T("..."), ...)`
- `vwscanf(FMT, ...)`
- `vwscanf("...", ...)`
