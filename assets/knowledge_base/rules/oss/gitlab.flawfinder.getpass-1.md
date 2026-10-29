---
name: oss/gitlab.flawfinder.getpass-1
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** This function is obsolete and not portable. It was in SUSv2 but removed by POSIX.2. What it does exactly varies considerably between systems, particularly in where its prompt is displayed and where it gets its data. Some systems will write to stderr instead of stdout. Some will read from stdin if it can not be read from /dev/tty. In some systems the buffer is static and limited to 127 characters, meaning the full password may not be returned properly. If you want to read input without terminal echoing enabled, see the description of the ECHO flag in the termios manual pager. If you ever read passwords from a terminal, be sure to zero the password as soon as possible, to avoid leaving the cleartext password visible in the process' address space.

**Why.** Reported as CWE-20. Ported from opengrep rule `gitlab.flawfinder.getpass-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.getpass-1` (metavariables start with `$`):

- `getpass(...)`
