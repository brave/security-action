---
name: oss/gitlab.flawfinder.MultiByteToWideChar-1
rubric: safety
severity: nit
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The input buffer is the number of bytes in the string, but the size of the output buffer is the number of characters. To avoid overflows, the application must determine the correct buffer size which depends on the data type the buffer receives. For more information see: https://learn.microsoft.com/en-us/windows/win32/intl/security-considerations--international-features

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.MultiByteToWideChar-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.MultiByteToWideChar-1` (metavariables start with `$`):

- `MultiByteToWideChar(...)`
