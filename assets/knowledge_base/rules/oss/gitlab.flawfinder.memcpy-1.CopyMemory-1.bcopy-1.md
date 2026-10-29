---
name: oss/gitlab.flawfinder.memcpy-1.CopyMemory-1.bcopy-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The `memcpy` family of functions require the developer to validate that the destination buffer is the same size or larger than the source buffer. Buffer overflows could be introduced if care is not taken to validate buffer sizes. If developing for C Runtime Library (CRT), more secure versions of these functions should be used, see: https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/memcpy-s-wmemcpy-s?view=msvc-170

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.memcpy-1.CopyMemory-1.bcopy-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.memcpy-1.CopyMemory-1.bcopy-1` (metavariables start with `$`):

- `memcpy(...)`
- `CopyMemory(...)`
- `bcopy(...)`
