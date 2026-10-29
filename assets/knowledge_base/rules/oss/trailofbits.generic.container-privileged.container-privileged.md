---
name: oss/trailofbits.generic.container-privileged.container-privileged
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found container command (docker, podman) with extended privileges

**Why.** Reported as CWE-250: Execution with Unnecessary Privileges. See https://docs.docker.com/engine/reference/commandline/run/. Ported from opengrep rule `trailofbits.generic.container-privileged.container-privileged` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.container-privileged.container-privileged` (metavariables start with `$`):

- `docker ... --privileged`
- `docker ... --cap-add=ALL`
- `docker ... --cap-add=SYS_ADMIN`
- `docker ... --cap-add=SYS_MODULE`
- `docker ... --net=host`
- `docker ... --userns=host`
- `docker ... --pid=host`
- `docker ... --ipc=host`
- `docker ... --security-opt seccomp=unconfined`
- `docker ... --security-opt apparmor=unconfined`
- `podman ... --privileged`
- `podman ... --cap-add=ALL`
- `podman ... --cap-add=SYS_ADMIN`
- `podman ... --cap-add=SYS_MODULE`
- `podman ... --net=host`
- `podman ... --userns=host`
- `podman ... --pid=host`
- `podman ... --ipc=host`
- `podman ... --security-opt seccomp=unconfined`
- `podman ... --security-opt apparmor=unconfined`
