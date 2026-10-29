---
name: oss/trailofbits.generic.node-disable-certificate-validation.node-disable-certificate-qoy5z1
rubric: safety
severity: should_fix
languages: [generic]
cwe: [CWE-295]
---

**Rule.** Setting this environment variable disables TLS certificate validation. This makes TLS, and HTTPS by extension, insecure. The use of this environment variable is strongly discouraged.

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://nodejs.org/api/cli.html#node_tls_reject_unauthorizedvalue. Ported from opengrep rule `trailofbits.generic.node-disable-certificate-validation.node-disable-certificate-validation` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.node-disable-certificate-validation.node-disable-certificate-validation` (metavariables start with `$`):

- `NODE_TLS_REJECT_UNAUTHORIZED=0`
- `NODE_TLS_REJECT_UNAUTHORIZED='0'`
- `NODE_TLS_REJECT_UNAUTHORIZED="0"`
