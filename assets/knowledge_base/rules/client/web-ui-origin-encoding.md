---
name: client/web-ui-origin-encoding
rubric: safety
severity: should_fix
languages: [typescript]
cwe: [CWE-116]
---

**Rule.** URI components should be encoded using encodeURIComponent. This prevents passed URLs and other encoded data from causing the WebUI URL from being malformed or parsed incorrectly.

**Why.** Reported as CWE-116: Improper Encoding or Escaping of Output. See https://github.com/brave/brave-browser/issues/43367. Ported from opengrep rule `web-ui-origin-encoding` (client/web-ui-origin-encoding.yaml).

## Examples

Bad:

```text
chrome://
brave://wallet
.*(\$\{|\+).*
```

Good:

```text
.*encodeURIComponent(...).*
chrome://favicon/size/
brave://wallet(\$\{)([A-Za-z0-9\/]+)\}
```

## Detection hints

Literal patterns from opengrep rule `web-ui-origin-encoding` (metavariables start with `$`):

- `"..."`
- `chrome://`
- `brave://wallet`
- `.*(\$\{|\+).*`
- `.*encodeURIComponent(...).*`
- `chrome://favicon/size/`
- `brave://wallet(\$\{)([A-Za-z0-9\/]+)\}`
