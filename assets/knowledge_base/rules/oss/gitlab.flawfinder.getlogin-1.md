---
name: oss/gitlab.flawfinder.getlogin-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-807]
---

**Rule.** The `getlogin` function suffers from many bugs or unknown behaviors depending on the system. Often, it gives only the first 8 characters of the login name. The user currently logged in on the controlling TTY of our program does not necessarily mean it is the user who started the process. Use getpwuid(geteuid()) and extract the desired information instead. For more information please see: https://linux.die.net/man/3/getpwuid

**Why.** Reported as CWE-807. Ported from opengrep rule `gitlab.flawfinder.getlogin-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.getlogin-1` (metavariables start with `$`):

- `getlogin(...)`
