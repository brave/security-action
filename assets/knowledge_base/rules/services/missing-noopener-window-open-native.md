---
name: services/missing-noopener-window-open-native
rubric: safety
severity: nit
languages: [typescript, javascript]
cwe: [CWE-200]
---

**Rule.** window.open should enforce `noopener` to avoid tab-nabbing vulnerabilities.

**Why.** Reported as CWE-200: Exposure of Sensitive Information to an Unauthorized Actor. See https://web.dev/external-anchors-use-rel-noopener/. See https://html.spec.whatwg.org/multipage/links.html#link-type-noreferrer. Ported from opengrep rule `missing-noopener-window-open-native` (services/missing-noopener-window-open-native.yaml).

## Examples

Bad:

```text
window.open($...URL)
document.open($...URL)
open($...URL)
window.open($URL, $TARGET, $FEATURES, ...)
document.open($URL, $TARGET, $FEATURES, ...)
open($URL, $TARGET, $FEATURES, ...)
```

## Detection hints

Literal patterns from opengrep rule `missing-noopener-window-open-native` (metavariables start with `$`):

- `window.open($...URL)`
- `document.open($...URL)`
- `open($...URL)`
- `window.open($URL, $TARGET, $FEATURES, ...)`
- `document.open($URL, $TARGET, $FEATURES, ...)`
- `open($URL, $TARGET, $FEATURES, ...)`
