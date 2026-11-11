---
name: client/refcounted-usage
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** Reference counting is occasionally useful but is more often a sign that someone isn't thinking carefully about ownership. Use it when ownership is truly shared (for example, multiple tabs sharing the same renderer process), not for when lifetime management is difficult to reason about.

**Why.** Ported from opengrep rule `refcounted-usage` (client/refcounted-usage.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `refcounted-usage` (metavariables start with `$`):

- `base::RefCounted<...>`
- `base::RefCountedThreadSafe<...>`
- `base::RefCountedData<...>`
