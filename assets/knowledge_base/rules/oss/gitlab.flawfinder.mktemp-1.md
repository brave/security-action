---
name: oss/gitlab.flawfinder.mktemp-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The `mktemp` function should no longer be used due to multiple flaws. Some implementations created random files by using known information like the process ID and a single letter. This allows for possible race conditions where an attacker could guess or manipulate these files prior to them being used. Consider using the `mkstemp` function instead, but be aware it also contains possible risks. Ensure the process has called the `umask` function with restricted permissions prior to calling `mkstemp` and validate the permissions prior to using the file descriptor. For more information on temporary files please see: https://wiki.sei.cmu.edu/confluence/pages/viewpage.action?pageId=87152425

**Why.** Reported as CWE-377. Ported from opengrep rule `gitlab.flawfinder.mktemp-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.mktemp-1` (metavariables start with `$`):

- `mktemp(...)`
