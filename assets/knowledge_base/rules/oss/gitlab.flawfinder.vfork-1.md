---
name: oss/gitlab.flawfinder.vfork-1
rubric: safety
severity: nit
languages: [c, cpp]
cwe: [CWE-362]
---

**Rule.** The `vfork` function is suffers from portability issues and is not recommended. In some Linux systems `vfork` is vulnerable to a race condition while the child process is running as the user's UID but hasn't executed `execve`. The user may be able to send signals to this process, which in `vfork` would not be sent to the parent process. As a result a user may be able to cause a denial of service against the privileged process. Use `fork` instead and be aware of other potential Time Of Check Time Of Use (TOCTOU) vulnerabilities. For more information please see: https://wiki.sei.cmu.edu/confluence/display/c/POS38-C.+Beware+of+race+conditions+when+using+fork+and+file+descriptors

**Why.** Reported as CWE-362. Ported from opengrep rule `gitlab.flawfinder.vfork-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.vfork-1` (metavariables start with `$`):

- `vfork(...)`
