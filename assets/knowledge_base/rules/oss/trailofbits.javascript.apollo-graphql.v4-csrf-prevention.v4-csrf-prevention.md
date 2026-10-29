---
name: oss/trailofbits.javascript.apollo-graphql.v4-csrf-prevention.v4-csrf-prevention
rubric: safety
severity: should_fix
languages: [js, ts]
---

**Rule.** The Apollo GraphQL server sets the 'csrfPrevention' option to false. This can enable CSRF attacks.

**Why.** Reported as CWE-352: Cross-Site Request Forgery (CSRF). See https://www.apollographql.com/docs/apollo-server/v3/security/cors/#preventing-cross-site-request-forgery-csrf. Ported from opengrep rule `trailofbits.javascript.apollo-graphql.v4-csrf-prevention.v4-csrf-prevention` (generated/oss/vulns.yaml).

## Examples

Bad:

```javascript
new ApolloServer({..., csrfPrevention: false, ...})
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.javascript.apollo-graphql.v4-csrf-prevention.v4-csrf-prevention` (metavariables start with `$`):

- `csrfPrevention:\s*false`
- `new ApolloServer({..., csrfPrevention: false, ...})`
