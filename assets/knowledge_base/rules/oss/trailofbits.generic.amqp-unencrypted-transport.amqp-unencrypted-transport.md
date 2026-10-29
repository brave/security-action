---
name: oss/trailofbits.generic.amqp-unencrypted-transport.amqp-unencrypted-transport
rubric: safety
severity: should_fix
languages: [generic]
cwe: [CWE-319]
---

**Rule.** Found unencrypted AMQP connection, prefer TLS encrypted `amqps://` transport

**Why.** Reported as CWE-319: Cleartext Transmission of Sensitive Information. See https://www.rabbitmq.com/docs/uri-spec#the-amqps-uri-scheme. Ported from opengrep rule `trailofbits.generic.amqp-unencrypted-transport.amqp-unencrypted-transport` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.amqp-unencrypted-transport.amqp-unencrypted-transport` (metavariables start with `$`):

- `amqp://...`
