---
name: client/unsafe-cpp-constructs
rubric: safety
severity: should_fix
languages: [cpp]
---

**Rule.** Potentially unsafe C++ construct detected

**Why.** See https://github.com/brave/brave-browser/wiki/Security-reviews. Ported from opengrep rule `unsafe_cpp_constructs` (client/unsafe-cpp-constructs.yaml).

## Examples

Bad:

```cpp
std::next(...)
std::advance(...)
std::prev(...)
void\*
#pragma allow_unsafe_buffers
```

## Detection hints

Literal patterns from opengrep rule `unsafe_cpp_constructs` (metavariables start with `$`):

- `std::next(...)`
- `std::advance(...)`
- `std::prev(...)`
- `void\*`
- `#pragma allow_unsafe_buffers`
