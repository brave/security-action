---
name: oss/raptor-insecure-api-alloca
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Use of alloca() is unsafe because it cannot ensure that the pointer returned points to a valid and usable block of memory. The allocation made may exceed the bounds of the stack, or even go further into other objects in memory, and alloca() cannot determine such an error.

**Why.** See https://cwe.mitre.org/data/definitions/676. See https://cwe.mitre.org/data/definitions/1325. See https://nullprogram.com/blog/2019/10/28/. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. Ported from opengrep rule `raptor-insecure-api-alloca` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-alloca` (metavariables start with `$`):

- `alloca(...)`
