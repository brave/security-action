---
name: oss/trailofbits.hcl.nomad.docker-privileged-mode.docker-privileged-mode
rubric: safety
severity: should_fix
languages: [hcl]
---

**Rule.** Found Nomad task using Docker containers in privileged mode

**Why.** Reported as CWE-250: Execution with Unnecessary Privileges. See https://developer.hashicorp.com/nomad/docs/drivers/docker#privileged. See https://developer.hashicorp.com/nomad/docs/drivers/docker#allow_privileged. Ported from opengrep rule `trailofbits.hcl.nomad.docker-privileged-mode.docker-privileged-mode` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.hcl.nomad.docker-privileged-mode.docker-privileged-mode` (metavariables start with `$`):

- `task "..." {
  ...
  config {
    ...
  }
  ...
}`
- `privileged = true`
- `plugin "$RUNTIME" {
  ...
  config {
    ...
  }
  ...
}`
- `allow_privileged = true`
- `(docker|podman)`
