---
name: services/url-constructor-base
rubric: safety
severity: nit
languages: [ts, js]
---

**Rule.** Are you using the `URL(url, base)` constructor as a security control to limit the origin with base `$BASE`? The base is ignored whenever url looks like an absolute URL, e.g. when it begins `protocol://`. `\\\\` or `//x.y`. Verify that the URL's origin is as expected rather than relying on the URL constructor.

**Why.** Reported as CWE-346: Origin Validation Error. See https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#parameters. Ported from opengrep rule `url-constructor-base` (services/url-constructor-base.yaml).

## Examples

Bad:

```typescript
new URL($A, $BASE)
```

Good:

```typescript
new URL("...", $BASE)
$VAR = new URL($A, $BASE)
...
<... $VAR.origin ...>
```

## Detection hints

Literal patterns from opengrep rule `url-constructor-base` (metavariables start with `$`):

- `new URL($A, $BASE)`
- `new URL("...", $BASE)`
- `$VAR = new URL($A, $BASE)
...
<... $VAR.origin ...>`
