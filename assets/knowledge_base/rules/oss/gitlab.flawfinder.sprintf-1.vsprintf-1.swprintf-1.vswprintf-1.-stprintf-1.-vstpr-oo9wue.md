---
name: oss/gitlab.flawfinder.sprintf-1.vsprintf-1.swprintf-1.vswprintf-1.-stprintf-1.-vstpr-oo9wue
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** Use sprintf_s, snprintf, or vsnprintf instead. The `sprintf` family of functions do not allow callers to set limits on how many bytes the destination buffer can hold. Consider using more secure alternatives such as `snprintf`. For more information please see: https://linux.die.net/man/3/snprintf If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/sprintf-s-sprintf-s-l-swprintf-s-swprintf-s-l?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.sprintf-1.vsprintf-1.swprintf-1.vswprintf-1._stprintf-1._vstprintf-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.sprintf-1.vsprintf-1.swprintf-1.vswprintf-1._stprintf-1._vstprintf-1` (metavariables start with `$`):

- `sprintf(...)`
- `vsprintf(...)`
- `swprintf(...)`
- `vswprintf(...)`
- `_stprintf(...)`
- `_vstprintf(...)`
