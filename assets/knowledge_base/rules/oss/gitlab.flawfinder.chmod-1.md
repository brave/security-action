---
name: oss/gitlab.flawfinder.chmod-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Usage of the `chmod` function call hints at a potential Time Of Check Time Of Use (TOCTOU) vulnerability. An attacker may be able to modify the file being specified by the `chmod` function prior to the `chmod` function being called. Since `chmod` will resolve symbolic links, an attacker may be able to exploit this fact to have files outside of their control modified. It is recommended that the `fchmod` function be used instead since this function takes a file descriptor instead of a file. Ensure the opened file descriptor is pointing to the correct file or directory prior to executing `fchmod` or any other file based operations. For more information please see: https://wiki.sei.cmu.edu/confluence/display/c/FIO01-C.+Be+careful+using+functions+that+use+file+names+for+identification

**Why.** Reported as CWE-362. Ported from opengrep rule `gitlab.flawfinder.chmod-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.chmod-1` (metavariables start with `$`):

- `chmod(...)`
