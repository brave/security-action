---
name: oss/gitlab.flawfinder.strlen-1.wcslen-1.-tcslen-1.-mbslen-1
rubric: safety
severity: nit
languages: [c, cpp]
cwe: [CWE-126]
---

**Rule.** The `strlen` family of functions does not handle strings that are not null terminated. This can lead to buffer over reads and cause the application to crash by accessing unintended memory locations. It is recommended that `strnlen` be used instead as a `maxlen` value can be provided. For more information please see: https://linux.die.net/man/3/strnlen If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/strnlen-strnlen-s?view=msvc-170

**Why.** Reported as CWE-126. Ported from opengrep rule `gitlab.flawfinder.strlen-1.wcslen-1._tcslen-1._mbslen-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.strlen-1.wcslen-1._tcslen-1._mbslen-1` (metavariables start with `$`):

- `strlen(...)`
- `wcslen(...)`
- `_tcslen(...)`
- `_mbslen(...)`
