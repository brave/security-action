---
name: oss/trailofbits.javascript.apollo-graphql.v3-cors-express.v3-express-bad-cors
rubric: safety
severity: should_fix
languages: [js, ts]
cwe: [CWE-942]
---

**Rule.** The Apollo GraphQL server is setup with a CORS policy that reflects any origin, or with a regex that has known flaws.

**Why.** Reported as CWE-942: Permissive Cross-domain Policy with Untrusted Domains. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. See https://www.apollographql.com/docs/apollo-server/v3/security/cors#configuring-cors-options-for-apollo-server. Ported from opengrep rule `trailofbits.javascript.apollo-graphql.v3-cors-express.v3-express-bad-cors` (generated/oss/vulns.yaml).

## Examples

Bad:

```javascript
// untrusted input (source)
true
$CORS_SINGLE_ORIGIN
[..., $CORS_SINGLE_ORIGIN, ...]
^/.*[^\\]\..*/$
^/.*[^$]/$
'null'
// flows to sink without sanitization
$X.applyMiddleware({..., cors: $CORS_ORIGIN, ...})
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.javascript.apollo-graphql.v3-cors-express.v3-express-bad-cors` (metavariables start with `$`):

- `{ origin: $BAD_CORS_ORIGIN }`
- `true`
- `$CORS_SINGLE_ORIGIN`
- `[..., $CORS_SINGLE_ORIGIN, ...]`
- `^/.*[^\\]\..*/$`
- `^/.*[^$]/$`
- `'null'`
- `$X = require('apollo-server-express');
...`
- `import 'apollo-server-express';
...`
- `$X = new ApolloServer({...})
...
$X.applyMiddleware({...})`
- `$X.applyMiddleware({..., cors: $CORS_ORIGIN, ...})`
