---
name: client/const-cast
rubric: correctness
severity: should_fix
languages: [cpp]
---

**Rule.** Avoid const_cast to remove const, except when implementing non-const getters in terms of const getters.

**Why.** See https://chromium.googlesource.com/chromium/src/+/main/styleguide/c++/c++-dos-and-donts.md#use-correctly. Ported from opengrep rule `const_cast` (client/const_cast.yaml).

## Examples

Bad:

```cpp
const_cast<$T>($ARG)
```

## Detection hints

Literal patterns from opengrep rule `const_cast` (metavariables start with `$`):

- `const_cast<$T>($ARG)`
