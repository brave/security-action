---
name: oss/trailofbits.ruby.rails-cache-store-marshal.rails-cache-store-marshal
rubric: safety
severity: should_fix
languages: [ruby]
cwe: [CWE-502]
---

**Rule.** Found Rails cache store configured to allow Marshaling. As of Rails 7.1 the default serializer is `:marshal_7_1`. If an attacker can inject data into the cache store (SSRF, etc.), then they can achieve code execution when the object is later deserialized. Consider using a custom serializer like JSON or MessagePack that does not fallback on Marshal.

**Why.** Reported as CWE-502: Deserialization of Untrusted Data. See https://github.com/rails/rails/blob/v7.1.4/activesupport/lib/active_support/cache.rb#L327. See https://github.com/rails/rails/blob/v7.1.4/activesupport/lib/active_support/cache/serializer_with_fallback.rb#L166-L172. See https://api.rubyonrails.org/v7.1.3.4/classes/ActiveSupport/Cache/MemCacheStore.html. See https://api.rubyonrails.org/v7.1.3.4/classes/ActiveSupport/Cache/Store.html. Ported from opengrep rule `trailofbits.ruby.rails-cache-store-marshal.rails-cache-store-marshal` (generated/oss/audit.yaml).

## Examples

Bad:

```text
config.cache_store = $STORE
config.cache_store = $STORE, ..., { ... }
config.cache_store = $STORE, ..., $OPTIONS
{ ..., serializer: :passthrough, ... }
{ ..., serializer: :marshal_6_1, ... }
{ ..., serializer: :marshal_7_0, ... }
{ ..., serializer: :marshal_7_1, ... }
{ ..., serializer: :message_pack, ... }
:file_store
:mem_cache_store
:redis_cache_store
```

Good:

```text
config.cache_store = $STORE2, ..., { ... }
config.cache_store = $STORE, ..., { ..., serializer: ..., ... }
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.ruby.rails-cache-store-marshal.rails-cache-store-marshal` (metavariables start with `$`):

- `Rails.application.configure do
...
end`
- `config.cache_store = $STORE`
- `config.cache_store = $STORE2, ..., { ... }`
- `config.cache_store = $STORE, ..., { ... }`
- `config.cache_store = $STORE, ..., { ..., serializer: ..., ... }`
- `config.cache_store = $STORE, ..., $OPTIONS`
- `{ ..., serializer: :passthrough, ... }`
- `{ ..., serializer: :marshal_6_1, ... }`
- `{ ..., serializer: :marshal_7_0, ... }`
- `{ ..., serializer: :marshal_7_1, ... }`
- `{ ..., serializer: :message_pack, ... }`
- `:file_store`
- `:mem_cache_store`
- `:redis_cache_store`
