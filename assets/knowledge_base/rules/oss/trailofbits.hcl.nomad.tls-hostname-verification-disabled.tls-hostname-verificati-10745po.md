---
name: oss/trailofbits.hcl.nomad.tls-hostname-verification-disabled.tls-hostname-verificati-10745po
rubric: safety
severity: should_fix
languages: [hcl]
cwe: [CWE-295]
---

**Rule.** Found Nomad `tls` block with server hostname verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://developer.hashicorp.com/nomad/docs/configuration/tls. See https://github.com/hashicorp/nomad/blob/v1.8.0/nomad/structs/config/tls.go#L25-L31. Ported from opengrep rule `trailofbits.hcl.nomad.tls-hostname-verification-disabled.tls-hostname-verification-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```text
verify_server_hostname = false
tls { ... }
```

Good:

```text
tls {
  ...
  verify_server_hostname = $ANY
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.hcl.nomad.tls-hostname-verification-disabled.tls-hostname-verification-disabled` (metavariables start with `$`):

- `tls {
  ...
  ca_file = ...
  ...
}`
- `tls {
  ...
  cert_file = ...
  ...
}`
- `tls {
  ...
  key_file = ...
  ...
}`
- `tls { ... }`
- `verify_server_hostname = false`
- `tls {
  ...
  verify_server_hostname = $ANY
  ...
}`
