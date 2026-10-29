---
name: oss/gitlab.flawfinder.system-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-78]
---

**Rule.** It is generally not recommended to call out to the operating system to execute commands. When the application is executing file system based commands, user input should never be used in constructing commands or command arguments. If possible, determine if a library can be used instead to provide the same functionality. Otherwise, consider hard coding both the command and arguments to be used, or at the very least restricting which arguments can be passed to the command execution function. For more information please see: https://wiki.sei.cmu.edu/confluence/pages/viewpage.action?pageId=87152177

**Why.** Reported as CWE-78. Ported from opengrep rule `gitlab.flawfinder.system-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.system-1` (metavariables start with `$`):

- `system(...)`
