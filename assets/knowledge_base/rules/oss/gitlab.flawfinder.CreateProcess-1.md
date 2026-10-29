---
name: oss/gitlab.flawfinder.CreateProcess-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Due to how `CreateProcess` parses spaces, an attacker may be able to exploit this function by creating a binary with the same name that is loaded first, depending on the search path order. Ensure that quotation marks around the executable path are used, such as: ``` CreateProcessA(NULL, "\"C:\\Program Files\\MyApp.exe\"", ...) ``` For more information, please see MSDNs documentation at: https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessa#security-remarks

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.flawfinder.CreateProcess-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.CreateProcess-1` (metavariables start with `$`):

- `CreateProcess(...)`
