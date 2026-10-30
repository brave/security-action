---
name: oss/trailofbits.javascript.apollo-graphql.v3-csrf-prevention.v3-csrf-prevention
rubric: safety
severity: should_fix
languages: [js, ts]
cwe: [CWE-352]
---

**Rule.** The Apollo GraphQL server lacks the 'csrfPrevention' option. This option is 'false' by the default in v3 of the Apollo GraphQL v3, which can enable CSRF attacks.

**Why.** Reported as CWE-352: Cross-Site Request Forgery (CSRF). See https://www.apollographql.com/docs/apollo-server/v3/security/cors/#preventing-cross-site-request-forgery-csrf. Ported from opengrep rule `trailofbits.javascript.apollo-graphql.v3-csrf-prevention.v3-csrf-prevention` (generated/oss/vulns.yaml).

## Examples

Bad:

```javascript
new ApolloServer({...})
```

Good:

```javascript
new ApolloServer({..., csrfPrevention: true, ...})
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.javascript.apollo-graphql.v3-csrf-prevention.v3-csrf-prevention` (metavariables start with `$`):

- `new ApolloServer({...})`
- `new ApolloServer({..., csrfPrevention: true, ...})`
