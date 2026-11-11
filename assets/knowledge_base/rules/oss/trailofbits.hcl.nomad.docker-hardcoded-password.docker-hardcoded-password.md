---
name: oss/trailofbits.hcl.nomad.docker-hardcoded-password.docker-hardcoded-password
rubric: safety
severity: should_fix
languages: [hcl]
cwe: [CWE-798]
---

**Rule.** Found Nomad task using Docker auth with hardcoded password

**Why.** Reported as CWE-798: Use of Hard-coded Credentials. See https://developer.hashicorp.com/nomad/docs/drivers/docker#password. Ported from opengrep rule `trailofbits.hcl.nomad.docker-hardcoded-password.docker-hardcoded-password` (generated/oss/audit.yaml).

## Examples

Bad:

```text
password = "..."
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.hcl.nomad.docker-hardcoded-password.docker-hardcoded-password` (metavariables start with `$`):

- `task "..." {
  ...
  driver = "$RUNTIME"
  ...
  config {
    ...
    auth {
      ...
    }
    ...
  }
  ...
}`
- `password = "..."`
- `(docker|podman)`
