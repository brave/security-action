---
name: oss/trailofbits.ruby.faraday-disable-verification.faraday-disable-verification
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-295]
---

**Rule.** Found Faraday HTTP request disabling SSL/TLS verification.

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://lostisland.github.io/faraday/#/customization/ssl-options. Ported from opengrep rule `trailofbits.ruby.faraday-disable-verification.faraday-disable-verification` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.faraday-disable-verification.faraday-disable-verification` (metavariables start with `$`):

- `Faraday.new(..., ssl: { ..., verify: false, ... }, ...)`
- `Faraday.new(..., ssl: { ..., verify_hostname: false, ... }, ...)`
- `Faraday.new(..., ssl: { ..., verify_mode: OpenSSL::SSL::VERIFY_NONE, ... }, ...)`
