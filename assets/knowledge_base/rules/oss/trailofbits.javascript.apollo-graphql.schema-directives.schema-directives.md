---
name: oss/trailofbits.javascript.apollo-graphql.schema-directives.schema-directives
rubric: safety
severity: should_fix
languages: [js, ts]
---

**Rule.** The Apollo GraphQL uses the 'schemaDirectives' option. This works in ApolloServer v2, but does nothing in version >=3. Depending on what the directives are used for, this can expose authenticated endpoints, disable rate limiting, and more. See the references on how to create custom directives in v3 and v4.

**Why.** Reported as CWE-686: Function Call With Incorrect Argument Type. See https://www.apollographql.com/docs/apollo-server/schema/directives/#custom-directives. Ported from opengrep rule `trailofbits.javascript.apollo-graphql.schema-directives.schema-directives` (generated/oss/vulns.yaml).

## Examples

Bad:

```javascript
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.javascript.apollo-graphql.schema-directives.schema-directives` (metavariables start with `$`):

- `new ApolloServer({..., schemaDirectives: ..., ...})`
