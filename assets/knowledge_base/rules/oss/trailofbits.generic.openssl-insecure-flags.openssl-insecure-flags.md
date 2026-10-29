---
name: oss/trailofbits.generic.openssl-insecure-flags.openssl-insecure-flags
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Found `openssl` command using insecure flags

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://www.openssl.org/docs/manmaster/man1/. Ported from opengrep rule `trailofbits.generic.openssl-insecure-flags.openssl-insecure-flags` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.generic.openssl-insecure-flags.openssl-insecure-flags` (metavariables start with `$`):

- `openssl ... -pass pass:`
- `openssl ... -passin pass:`
- `openssl ... -passout pass:`
- `openssl ... -nodes`
- `openssl ... -noenc`
- `openssl ... -sha1`
