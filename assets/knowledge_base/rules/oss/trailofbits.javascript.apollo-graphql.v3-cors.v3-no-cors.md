---
name: oss/trailofbits.javascript.apollo-graphql.v3-cors.v3-no-cors
rubric: safety
severity: should_fix
languages: [js, ts]
---

**Rule.** The Apollo GraphQL server lacks a CORS policy. By default, the batteries-included apollo-server package serves the Access-Control-Allow-Origin HTTP header with the wildcard value (*).

**Why.** Reported as CWE-942: Permissive Cross-domain Policy with Untrusted Domains. See https://www.apollographql.com/docs/apollo-server/v3/security/cors#configuring-cors-options-for-apollo-server. Ported from opengrep rule `trailofbits.javascript.apollo-graphql.v3-cors.v3-no-cors` (generated/oss/vulns.yaml).

## Examples

Bad:

```javascript
new ApolloServer({...})
```

Good:

```javascript
new ApolloServer({..., cors: ..., ...})
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.javascript.apollo-graphql.v3-cors.v3-no-cors` (metavariables start with `$`):

- `$X = require('apollo-server');
...`
- `import 'apollo-server';
...`
- `new ApolloServer({...})`
- `new ApolloServer({..., cors: ..., ...})`
