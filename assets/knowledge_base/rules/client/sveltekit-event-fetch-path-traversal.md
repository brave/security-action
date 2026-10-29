---
name: client/sveltekit-event-fetch-path-traversal
rubric: safety
severity: should_fix
languages: [ts, js]
---

**Rule.** User-supplied parameter is interpolated into an `event.fetch()` URL without sanitization. An attacker can inject `../` sequences to reach arbitrary internal API endpoints. Wrap the value with `validateURLParam()` or `encodeURIComponent()` before interpolation.

**Why.** Reported as CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal'). Untrusted data matching the source patterns reaches the sink without passing a sanitizer. See https://cwe.mitre.org/data/definitions/22.html. See https://owasp.org/www-community/attacks/Path_Traversal. Ported from opengrep rule `sveltekit-event-fetch-path-traversal` (client/sveltekit-event-fetch-path-traversal.yaml).

## Examples

Bad:

```typescript
// untrusted input (source)
$DATA.get('...') as $TYPE
$DATA.get('...')
$EVENT.url.searchParams.get('...')
// flows to sink without sanitization
event.fetch(`...${...}...`, ...)
```

Good:

```typescript
validateURLParam(...)
encodeURIComponent(...)
```

## Detection hints

Literal patterns from opengrep rule `sveltekit-event-fetch-path-traversal` (metavariables start with `$`):

- `$DATA.get('...') as $TYPE`
- `$DATA.get('...')`
- `$EVENT.url.searchParams.get('...')`
- `validateURLParam(...)`
- `encodeURIComponent(...)`
- `event.fetch(`...${...}...`, ...)`
