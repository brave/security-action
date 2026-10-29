---
name: oss/trailofbits.generic.redis-unencrypted-transport.redis-unencrypted-transport
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found unencrypted Redis connection, prefer TLS encrypted `rediss://` transport

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://redis.io/docs/latest/develop/connect/cli/#host-port-password-and-database. Ported from opengrep rule `trailofbits.generic.redis-unencrypted-transport.redis-unencrypted-transport` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.redis-unencrypted-transport.redis-unencrypted-transport` (metavariables start with `$`):

- `redis://...`
