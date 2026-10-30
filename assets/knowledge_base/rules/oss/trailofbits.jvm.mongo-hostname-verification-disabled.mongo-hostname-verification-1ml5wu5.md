---
name: oss/trailofbits.jvm.mongo-hostname-verification-disabled.mongo-hostname-verification-1ml5wu5
rubric: safety
severity: should_fix
languages: [java, kotlin]
cwe: [CWE-295]
---

**Rule.** Found MongoDB client with SSL hostname verification disabled

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://www.mongodb.com/docs/drivers/java/sync/current/fundamentals/connection/tls/#disable-hostname-verification. Ported from opengrep rule `trailofbits.jvm.mongo-hostname-verification-disabled.mongo-hostname-verification-disabled` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.jvm.mongo-hostname-verification-disabled.mongo-hostname-verification-disabled` (metavariables start with `$`):

- `$SETTINGS.invalidHostNameAllowed(true)`
