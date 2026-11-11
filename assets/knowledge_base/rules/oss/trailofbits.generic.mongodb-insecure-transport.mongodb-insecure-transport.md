---
name: oss/trailofbits.generic.mongodb-insecure-transport.mongodb-insecure-transport
rubric: safety
severity: should_fix
languages: [regex]
cwe: [CWE-295]
---

**Rule.** Found insecure MongoDB connection, prefer TLS encrypted transport by setting the `tls=true` connection option and ensuring proper verification

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://www.mongodb.com/docs/manual/reference/connection-string/#connection-options. Ported from opengrep rule `trailofbits.generic.mongodb-insecure-transport.mongodb-insecure-transport` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.mongodb-insecure-transport.mongodb-insecure-transport` (metavariables start with `$`):

- `(?i)mongodb://.+$`
- `(?i)(?:(.)?)?mongodb://.+[?&]tls=true(?:\g{1}|$|&).*`
- `(?i)(?:(.)?)?mongodb://.+[?&]ssl=true(?:\g{1}|$|&).*`
- `(?i)mongodb://.+[?&]tlsAllowInvalidCertificates=true.*$`
- `(?i)mongodb://.+[?&]tlsAllowInvalidHostnames=true.*$`
- `(?i)mongodb://.+[?&]tlsInsecure=true.*$`
