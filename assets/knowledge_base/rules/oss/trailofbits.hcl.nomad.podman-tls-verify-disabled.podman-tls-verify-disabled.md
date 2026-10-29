---
name: oss/trailofbits.hcl.nomad.podman-tls-verify-disabled.podman-tls-verify-disabled
rubric: safety
severity: should_fix
languages: [hcl]
---

**Rule.** Found Nomad task using Podman with registry TLS verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://developer.hashicorp.com/nomad/plugins/drivers/podman#auth. Ported from opengrep rule `trailofbits.hcl.nomad.podman-tls-verify-disabled.podman-tls-verify-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```text
tlsVerify = false
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.hcl.nomad.podman-tls-verify-disabled.podman-tls-verify-disabled` (metavariables start with `$`):

- `task "..." {
  ...
  driver = "podman"
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
- `tlsVerify = false`
