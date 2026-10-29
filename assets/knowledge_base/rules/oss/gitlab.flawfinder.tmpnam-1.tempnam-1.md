---
name: oss/gitlab.flawfinder.tmpnam-1.tempnam-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** There exists a possible race condition in between the time that `tempnam` or `tmpnam` returns a pathname, and the time that the program opens it, another program might create that pathname using `open`, or create it as a symbolic link. Consider using the `mkstemp` function instead, but be aware it also contains possible risks. Ensure the process has called the `umask` function with restricted permissions prior to calling `mkstemp` and validate the permissions prior to using the file descriptor. For more information on temporary files please see: https://wiki.sei.cmu.edu/confluence/pages/viewpage.action?pageId=87152425

**Why.** Reported as CWE-377. Ported from opengrep rule `gitlab.flawfinder.tmpnam-1.tempnam-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.tmpnam-1.tempnam-1` (metavariables start with `$`):

- `tmpnam(...)`
- `tempnam(...)`
