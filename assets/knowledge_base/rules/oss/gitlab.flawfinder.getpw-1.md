---
name: oss/gitlab.flawfinder.getpw-1
rubric: safety
severity: should_fix
languages: [c]
---

**Rule.** The getpw() function is dangerous as it may overflow the provided buffer when reading from the `/etc/passwd` file. While the passwd file is not generally writeable, there are no protections offered by this function to protect from reading past the bounds of the destination buffer. This function is obsoleted by `getpwuid`. For more information please see: https://linux.die.net/man/3/getpwuid

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.getpw-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.getpw-1` (metavariables start with `$`):

- `getpw(...)`
