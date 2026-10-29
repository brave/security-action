---
name: oss/trailofbits.ruby.action-mailer-insecure-tls.action-mailer-insecure-tls
rubric: safety
severity: should_fix
languages: [ruby]
---

**Rule.** Found ActionMailer SMTP configuration with insecure TLS setting. These settings do not require a successful, encrypted, verified TLS connection is made. Set `enable_starttls: true` and `openssl_verify_mode` to verify peer

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://guides.rubyonrails.org/action_mailer_basics.html#action-mailer-configuration. Ported from opengrep rule `trailofbits.ruby.action-mailer-insecure-tls.action-mailer-insecure-tls` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.action-mailer-insecure-tls.action-mailer-insecure-tls` (metavariables start with `$`):

- `ActionMailer::Base.smtp_settings = { ..., openssl_verify_mode: OpenSSL::SSL::VERIFY_NONE, ... }`
- `ActionMailer::Base.smtp_settings = { ..., openssl_verify_mode: 'none', ... }`
- `ActionMailer::Base.smtp_settings = { ..., enable_starttls_auto: true, ... }`
