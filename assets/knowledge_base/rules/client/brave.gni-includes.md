---
name: client/brave.gni-includes
rubric: safety
severity: should_fix
languages: [generic]
---

**Rule.** `check_includes = false` should not be used since it disables gn dependency checking. `check_includes` behaviour should not be explicitly changed.

**Why.** Ported from opengrep rule `brave.gni_includes` (client/check_includes.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `brave.gni_includes` (metavariables start with `$`):

- `check_includes`
