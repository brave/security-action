---
name: oss/gitlab.flawfinder.mkstemp-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** Some older Unix-like systems, `mkstemp` would create temp files with 0666 permissions, meaning the file created would be read/write access for all users. Ensure the process has called the `umask` function with restricted permissions prior to calling `mkstemp` and validate the permissions prior to using the file descriptor. For more information on temporary files please see: https://wiki.sei.cmu.edu/confluence/pages/viewpage.action?pageId=87152425

**Why.** Reported as CWE-377. Ported from opengrep rule `gitlab.flawfinder.mkstemp-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.mkstemp-1` (metavariables start with `$`):

- `mkstemp(...)`
