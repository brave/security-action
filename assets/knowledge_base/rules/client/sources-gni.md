---
name: client/sources-gni
rubric: correctness
severity: should_fix
languages: [generic]
---

**Rule.** New source files should not be added to sources.gni. Please see https://github.com/brave/brave-core/blob/master/docs/gni_sources.md for details

**Why.** See https://github.com/brave/brave-core/blob/master/docs/gni_sources.md. Ported from opengrep rule `sources_gni` (client/sources_gni.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `sources_gni` (metavariables start with `$`):

- `.*\.h"`
- `.*\.cc"`
- `.*\.mm"`
- `.*\.cpp"`
- `.*\.hpp"`
