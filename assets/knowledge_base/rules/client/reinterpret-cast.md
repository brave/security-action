---
name: client/reinterpret-cast
rubric: safety
severity: should_fix
languages: [cpp]
cwe: [CWE-704]
---

**Rule.** Using `reinterpret_cast` against some data types may lead to undefined behaviour. In general, when needing to do these conversions, check how Chromium upstream does them. Most of the times a reinterpret_cast is wrong and there's no guarantee the compiler will generate the code that you thought it would.

**Why.** Reported as CWE-704: Incorrect Type Conversion or Cast. See https://chromium.googlesource.com/chromium/src/+/main/docs/unsafe_buffers.md#Avoid-reinterpret_cast. Ported from opengrep rule `reinterpret_cast` (client/reinterpret_cast.yaml).

## Examples

Bad:

```cpp
reinterpret_cast<$T>($ARG)
```

## Detection hints

Literal patterns from opengrep rule `reinterpret_cast` (metavariables start with `$`):

- `reinterpret_cast<$T>($ARG)`
- `^(.*int.*|.*double.*|.*float.*|.*char.*|.*size_t.*)$`
