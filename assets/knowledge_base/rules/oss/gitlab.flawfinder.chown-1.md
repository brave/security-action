---
name: oss/gitlab.flawfinder.chown-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-362]
---

**Rule.** Usage of the `chown` function call hints at a potential Time Of Check Time Of Use (TOCTOU) vulnerability. An attacker may be able to modify the file being specified by the `chmod` function prior to the `chown` function being called. Since `chown` will resolve symbolic links, an attacker may be able to exploit this fact to have files outside of their control modified. It is recommended that the `fchown` or the `lchown` functions be used instead. The `fchown` function takes a file descriptor instead of a file. The `lchown` function does not follow symbolic links. Ensure the opened file descriptor is pointing to the correct file or directory prior to executing `fchown` or any other file based operations. For more information please see: https://wiki.sei.cmu.edu/confluence/display/c/FIO01-C.+Be+careful+using+functions+that+use+file+names+for+identification

**Why.** Reported as CWE-362. Ported from opengrep rule `gitlab.flawfinder.chown-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.chown-1` (metavariables start with `$`):

- `chown(...)`
