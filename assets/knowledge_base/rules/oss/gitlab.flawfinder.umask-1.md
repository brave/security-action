---
name: oss/gitlab.flawfinder.umask-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The umask function call sets the process's file mode creation mask. umask values determine what permissions a file should be created with and who can read or write to these files. Ensure that umask is given most restrictive possible setting depending on the context, usually 066 or 077, for more information please see: https://en.wikipedia.org/wiki/Umask#Mask_effect.

**Why.** Reported as CWE-732. Ported from opengrep rule `gitlab.flawfinder.umask-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.umask-1` (metavariables start with `$`):

- `umask(...)`
