---
name: oss/gitlab.flawfinder.fopen-1.open-1
rubric: safety
severity: nit
languages: [c, cpp]
cwe: [CWE-362]
---

**Rule.** Usage of the `open` family of functions may hint at a potential Time Of Check Time Of Use (TOCTOU) vulnerability. An attacker may be able to modify the file being specified by the `open` function prior to the `open` function being called. Prior to calling `open`, use `lstat` to open the file and confirm the attributes are correct. Then use `open` to get a file descriptor to this file. Call `fstat` on the `open` file descriptor to confirm that `st_dev` and `st_ino` are equal between the two. If they are, it is safe to read and operate on the file's contents. For more information please see: https://wiki.sei.cmu.edu/confluence/display/c/FIO45-C.+Avoid+TOCTOU+race+conditions+while+accessing+files

**Why.** Reported as CWE-362. Ported from opengrep rule `gitlab.flawfinder.fopen-1.open-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.fopen-1.open-1` (metavariables start with `$`):

- `fopen(...)`
- `open(...)`
