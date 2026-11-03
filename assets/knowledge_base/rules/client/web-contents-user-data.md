---
name: client/web-contents-user-data
rubric: correctness
severity: nit
languages: [generic]
---

**Rule.** Prefer dependency injection References: - https://chromium.googlesource.com/chromium/src/+/main/docs/chrome_browser_design_principles.md#structure_modularity

**Why.** See https://chromium.googlesource.com/chromium/src/+/main/docs/chrome_browser_design_principles.md#structure_modularity. Ported from opengrep rule `web-contents-user-data` (client/web-contents-user-data.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `web-contents-user-data` (metavariables start with `$`):

- `public content::WebContentsUserData`
- `public WebContentsUserData`
