---
name: oss/gitlab.flawfinder.readlink-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Usage of the `readlink` function call hints at a potential Time Of Check Time Of Use (TOCTOU) vulnerability. An attacker may be able to modify the file being specified by the `readlink` function prior to the `readlink` function being called. Additionally, care must be taken that the buffer provided is large enough to hold the contents of the file. Instead of using `readlink`, use `lstat` prior to opening the file and confirm the attributes are correct. Then use `open` to get a file descriptor to this file. Call `fstat` on the `open` file descriptor to confirm that `st_dev` and `st_ino` are equal between the two. If they are, it is safe to read and operate on the file's contents. For more information please see: https://wiki.sei.cmu.edu/confluence/display/c/FIO45-C.+Avoid+TOCTOU+race+conditions+while+accessing+files

**Why.** Reported as CWE-20. Ported from opengrep rule `gitlab.flawfinder.readlink-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.readlink-1` (metavariables start with `$`):

- `readlink(...)`
