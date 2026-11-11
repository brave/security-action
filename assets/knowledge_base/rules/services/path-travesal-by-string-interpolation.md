---
name: services/path-travesal-by-string-interpolation
rubric: safety
severity: nit
languages: [ts, js]
cwe: [CWE-22]
---

**Rule.** The code contains new security hotspots which should be checked manually by a security team member! Could a user perform path traversal by setting a variable to include `../`?

**Why.** Reported as CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal'). Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `path-travesal-by-string-interpolation` (services/path-travesal-by-string-interpolation.yaml).

## Examples

Bad:

```typescript
// untrusted input (source)
$VAR
// flows to sink without sanitization
fetch($URL, ...)
(`.[^#?]+\$)
```

## Detection hints

Literal patterns from opengrep rule `path-travesal-by-string-interpolation` (metavariables start with `$`):

- `$VAR`
- `^(env|process|config)\.`
- `fetch($URL, ...)`
- `(`.[^#?]+\$)`
