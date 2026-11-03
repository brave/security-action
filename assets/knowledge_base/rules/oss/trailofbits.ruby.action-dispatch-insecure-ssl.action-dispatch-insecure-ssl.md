---
name: oss/trailofbits.ruby.action-dispatch-insecure-ssl.action-dispatch-insecure-ssl
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-295]
---

**Rule.** Found Rails application with insecure SSL setting.

**Why.** Reported as CWE-295: Improper Certificate Validation. See https://api.rubyonrails.org/v7.1.3.4/classes/ActionDispatch/SSL.html. Ported from opengrep rule `trailofbits.ruby.action-dispatch-insecure-ssl.action-dispatch-insecure-ssl` (generated/oss/audit.yaml).

## Examples

Bad:

```text
config.force_ssl = false
config.ssl_options = { ..., secure_cookies: false, ... }
config.ssl_options = { ..., hsts: false, ... }
config.ssl_options = { ..., hsts: { ..., subdomains: false, ... }, ... }
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.action-dispatch-insecure-ssl.action-dispatch-insecure-ssl` (metavariables start with `$`):

- `Rails.application.configure do
  ...
end`
- `config.force_ssl = false`
- `config.ssl_options = { ..., secure_cookies: false, ... }`
- `config.ssl_options = { ..., hsts: false, ... }`
- `config.ssl_options = { ..., hsts: { ..., subdomains: false, ... }, ... }`
