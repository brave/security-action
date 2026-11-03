---
name: oss/gitlab.flawfinder.access-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-362]
---

**Rule.** Usage of the `access` function call hints at a potential Time Of Check Time Of Use (TOCTOU) vulnerability. Using the `access` function to check if a file exists and is readable before opening it, an attacker can create a race condition between the `access` call and opening the file. The attacker could replace the file with a different one or modify its content between the time the `access` function is called and the file is opened, thus bypassing the permission check. Call `setuid` to drop privileges on the process prior to opening any files. Instead of using `access`, use `lstat` prior to opening the file and confirm the attributes are correct. Then use `open` to get a file descriptor to this file. Call `fstat` on the `open` file descriptor to confirm that `st_dev` and `st_ino` are equal between the two. If they are, it is safe to read and operate on the file's contents. For more information please see: https://wiki.sei.cmu.edu/confluence/display/c/FIO45-C.+Avoid+TOCTOU+race+conditions+while+accessing+files

**Why.** Reported as CWE-362. Ported from opengrep rule `gitlab.flawfinder.access-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.access-1` (metavariables start with `$`):

- `access(...)`
