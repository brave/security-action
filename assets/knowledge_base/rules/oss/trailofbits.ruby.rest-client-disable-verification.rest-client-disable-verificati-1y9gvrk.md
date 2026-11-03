---
name: oss/trailofbits.ruby.rest-client-disable-verification.rest-client-disable-verificati-1y9gvrk
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-295]
---

**Rule.** Found RestClient HTTP request disabling SSL/TLS verification.

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://github.com/rest-client/rest-client#ssl-client-certificates. Ported from opengrep rule `trailofbits.ruby.rest-client-disable-verification.rest-client-disable-verification` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$FUNC(..., :verify_ssl => false, ...)
$FUNC(..., :verify_ssl => OpenSSL::SSL::VERIFY_NONE, ...)
RestClient::Resource.new
RestClient::Request.new
RestClient::Request.execute
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.rest-client-disable-verification.rest-client-disable-verification` (metavariables start with `$`):

- `$FUNC(..., :verify_ssl => false, ...)`
- `$FUNC(..., :verify_ssl => OpenSSL::SSL::VERIFY_NONE, ...)`
- `RestClient::Resource.new`
- `RestClient::Request.new`
- `RestClient::Request.execute`
