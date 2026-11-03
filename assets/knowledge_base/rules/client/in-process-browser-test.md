---
name: client/in-process-browser-test
rubric: correctness
severity: should_fix
languages: [generic]
---

**Rule.** Most browser tests should be PlatformBrowserTest so they can run on android.

**Why.** Ported from opengrep rule `in-process-browser-test` (client/in-process-browser-test.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `in-process-browser-test` (metavariables start with `$`):

- `class $CLASS : public InProcessBrowserTest`
