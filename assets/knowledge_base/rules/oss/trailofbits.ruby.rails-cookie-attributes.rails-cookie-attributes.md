---
name: oss/trailofbits.ruby.rails-cookie-attributes.rails-cookie-attributes
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-345]
---

**Rule.** Found Rails cookie set with insecure attribute.

**Why.** Reported as CWE-345: Insufficient Verification of Data Authenticity. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie. See https://api.rubyonrails.org/classes/ActionDispatch/Session/CookieStore.html. Ported from opengrep rule `trailofbits.ruby.rails-cookie-attributes.rails-cookie-attributes` (generated/oss/audit.yaml).

## Examples

Bad:

```text
{..., same_site: :none, ...}
{..., same_site: :lax, ...}
{..., httponly: false, ...}
{..., secure: false, ...}
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.rails-cookie-attributes.rails-cookie-attributes` (metavariables start with `$`):

- `cookies[$ANY] = ...`
- `cookies. ... .$ATTR[$ANY] = ...`
- `{..., same_site: :none, ...}`
- `{..., same_site: :lax, ...}`
- `{..., httponly: false, ...}`
- `{..., secure: false, ...}`
