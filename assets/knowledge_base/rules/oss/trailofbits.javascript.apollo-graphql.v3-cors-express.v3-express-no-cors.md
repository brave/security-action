---
name: oss/trailofbits.javascript.apollo-graphql.v3-cors-express.v3-express-no-cors
rubric: safety
severity: should_fix
languages: [js, ts]
---

**Rule.** The Apollo GraphQL server lacks a CORS policy. By default, the server uses the Access-Control-Allow-Origin HTTP header with the wildcard value (*).

**Why.** Reported as CWE-942: Permissive Cross-domain Policy with Untrusted Domains. See https://www.apollographql.com/docs/apollo-server/v3/security/cors#configuring-cors-options-for-apollo-server. Ported from opengrep rule `trailofbits.javascript.apollo-graphql.v3-cors-express.v3-express-no-cors` (generated/oss/vulns.yaml).

## Examples

Bad:

```javascript
$X = new ApolloServer({...})
```

Good:

```javascript
$X = new ApolloServer({...})
...
$X.applyMiddleware({..., cors: ..., ...})
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.javascript.apollo-graphql.v3-cors-express.v3-express-no-cors` (metavariables start with `$`):

- `$X = require('apollo-server-express');
...`
- `import 'apollo-server-express';
...`
- `$X = new ApolloServer({...})`
- `$X = new ApolloServer({...})
...
$X.applyMiddleware({..., cors: ..., ...})`
