---
name: oss/trailofbits.ruby.insecure-rails-cookie-session-store.insecure-rails-cookie-sessi-9fhl80
rubric: safety
severity: should_fix
languages: [ruby]
---

**Rule.** Found Rails session cookie missing SameSite=Secure. As of Rails 7.2, session cookies default to SameSite=Lax.

**Why.** Reported as CWE-345: Insufficient Verification of Data Authenticity. See https://api.rubyonrails.org/classes/ActionDispatch/Session/CookieStore.html. Ported from opengrep rule `trailofbits.ruby.insecure-rails-cookie-session-store.insecure-rails-cookie-session-store` (generated/oss/audit.yaml).

## Examples

Bad:

```text
Rails.application.config.session_store(:cookie_store, ...)
```

Good:

```text
Rails.application.config.session_store(:cookie_store, ..., same_site: :secure, ...)
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.insecure-rails-cookie-session-store.insecure-rails-cookie-session-store` (metavariables start with `$`):

- `Rails.application.config.session_store(:cookie_store, ...)`
- `Rails.application.config.session_store(:cookie_store, ..., same_site: :secure, ...)`
