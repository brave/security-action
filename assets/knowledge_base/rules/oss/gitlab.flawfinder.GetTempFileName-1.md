---
name: oss/gitlab.flawfinder.GetTempFileName-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-377]
---

**Rule.** The `GetTempFileName` function works by generating a randomly named file, creating the file (if it does not exist) and then closing it. An application wishing to use this temporary file will need to reopen this file to begin working with it. This leads to a potential Time Of Check Time Of Use (TOCTOU) vulnerability, as an attacker could replace or modify the contents of the file prior to it being used by the application. Consider generating a random filename and opening the file directly in a single `CreateFile` or `OpenFile` call.

**Why.** Reported as CWE-377. Ported from opengrep rule `gitlab.flawfinder.GetTempFileName-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.GetTempFileName-1` (metavariables start with `$`):

- `GetTempFileName(...)`
