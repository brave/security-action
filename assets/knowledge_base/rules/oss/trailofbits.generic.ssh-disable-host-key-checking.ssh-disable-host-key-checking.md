---
name: oss/trailofbits.generic.ssh-disable-host-key-checking.ssh-disable-host-key-checking
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found `ssh` command disabling host key checking

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://man7.org/linux/man-pages/man1/ssh.1.html. Ported from opengrep rule `trailofbits.generic.ssh-disable-host-key-checking.ssh-disable-host-key-checking` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.ssh-disable-host-key-checking.ssh-disable-host-key-checking` (metavariables start with `$`):

- `ssh ... StrictHostKeyChecking=no`
