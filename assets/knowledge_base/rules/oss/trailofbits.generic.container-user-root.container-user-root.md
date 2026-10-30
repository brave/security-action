---
name: oss/trailofbits.generic.container-user-root.container-user-root
rubric: safety
severity: should_fix
languages: [generic]
cwe: [CWE-250]
---

**Rule.** Found container command running as root

**Why.** Reported as CWE-250: Execution with Unnecessary Privileges. See https://docs.docker.com/engine/reference/commandline/run/. Ported from opengrep rule `trailofbits.generic.container-user-root.container-user-root` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.container-user-root.container-user-root` (metavariables start with `$`):

- `docker ... -u root`
- `docker ... -u 0`
- `docker ... --user root`
- `docker ... --user 0`
- `podman ... -u root`
- `podman ... --u 0`
- `podman ... --user root`
- `podman ... --user 0`
