---
name: services/nodejs-insecure-url-parse
rubric: safety
severity: should_fix
languages: [javascript]
---

**Rule.** Avoid using url.parse() as it is prone to security issues such as hostname spoofing. Use the URL class instead.

**Why.** Reported as CWE-20: Improper Input Validation. See https://nodejs.org/api/url.html#urlparseurlstring-parsequerystring-slashesdenotehost. See https://nodejs.org/api/url.html#the-whatwg-url-api. Ported from opengrep rule `nodejs-insecure-url-parse` (services/nodejs-insecure-url-parse.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `nodejs-insecure-url-parse` (metavariables start with `$`):

- `url.parse(...)`
- `require('url').parse(...)`
