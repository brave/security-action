---
name: client/chromium-insecure-gurl
rubric: safety
severity: should_fix
languages: [cpp, c]
---

**Rule.** Use origin (rather than URL) for security decisions. URLs are often not sufficient for security decisions, since the origin may not be present in the URL (e.g., about:blank), may be tricky to parse (e.g., blob: or filesystem: URLs), or may be opaque despite a normal-looking URL (e.g., the security context may be sandboxed). Use origins whenever possible. https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/security/origin-vs-url.md

**Why.** Reported as CWE-346: Origin Validation Error. Ported from opengrep rule `chromium-insecure-gurl` (client/chromium-insecure-gurl.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `chromium-insecure-gurl` (metavariables start with `$`):

- `$TYPE $VAR = ...;`
- `origin`
- `^(G|K)URL$`
- `((GURL)$VAR).DeprecatedGetOriginAsURL();`
- `SecurityOrigin::Create((KURL $VAR));`
- `SecurityOrigin::Create((GURL $VAR));`
