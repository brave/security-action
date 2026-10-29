---
name: oss/trailofbits.javascript.apollo-graphql.v3-cors-audit.v3-potentially-bad-cors
rubric: safety
severity: should_fix
languages: [js, ts]
---

**Rule.** The Apollo GraphQL server is setup with a CORS policy that does not deny all origins. Carefully review the origins to see if any of them are incorrectly setup (third-party websites, bad regexes, functions that reflect every origin, etc.).

**Why.** Reported as CWE-942: Permissive Cross-domain Policy with Untrusted Domains. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. See https://www.apollographql.com/docs/apollo-server/v3/security/cors#configuring-cors-options-for-apollo-server. Ported from opengrep rule `trailofbits.javascript.apollo-graphql.v3-cors-audit.v3-potentially-bad-cors` (generated/oss/audit.yaml).

## Examples

Bad:

```javascript
// untrusted input (source)
{ origin: function(...) {...} }
// flows to sink without sanitization
{..., cors: $CORS_ORIGIN, ...}
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.javascript.apollo-graphql.v3-cors-audit.v3-potentially-bad-cors` (metavariables start with `$`):

- `{ origin: function(...) {...} }`
- `{ origin: $NOT_KNOWN_GOOD_CORS_ORIGIN }`
- `false`
- `[]`
- `{..., cors: $CORS_ORIGIN, ...}`
