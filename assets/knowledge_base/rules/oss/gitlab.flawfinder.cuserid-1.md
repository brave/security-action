---
name: oss/gitlab.flawfinder.cuserid-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** `cuserid()` is poorly defined (e.g., some systems use the effective UID, like Linux, while others like System V use the real UID). Therefore, you can't trust what it does. The cuserid function was included in the 1988 version of POSIX, but removed from the 1990 version. Also, if passed a non-null parameter, there's a risk of a buffer overflow if the passed-in buffer is not at least `L_cuserid` characters long. Use `getpwuid(geteuid())` and extract the desired information instead. For more information please see: https://linux.die.net/man/3/getpwuid

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.cuserid-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.cuserid-1` (metavariables start with `$`):

- `cuserid(...)`
