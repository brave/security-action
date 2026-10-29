---
name: oss/trailofbits.javascript.apollo-graphql.use-of-graphql-upload.use-of-graphql-uploa-1x863x8
rubric: safety
severity: should_fix
languages: [js, ts]
---

**Rule.** The Apollo GraphQL server is using the graphql-upload library. This library allows file uploads using POSTs with content-type: multipart/form-data, which can enable to CSRF attacks. Ensure that you are enabling CSRF protection if you really need to use graphql-upload .

**Why.** Reported as CWE-352: Cross-Site Request Forgery (CSRF). See https://github.com/apollographql/apollo-server/security/advisories/GHSA-2p3c-p3qw-69r4. Ported from opengrep rule `trailofbits.javascript.apollo-graphql.use-of-graphql-upload.use-of-graphql-upload` (generated/oss/vulns.yaml).

## Examples

Bad:

```javascript
app.use(graphqlUploadExpress());
```

## Detection hints

Literal patterns from opengrep rule `trailofbits.javascript.apollo-graphql.use-of-graphql-upload.use-of-graphql-upload` (metavariables start with `$`):

- `app.use(graphqlUploadExpress());`
