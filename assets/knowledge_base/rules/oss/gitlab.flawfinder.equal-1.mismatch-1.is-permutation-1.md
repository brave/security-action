---
name: oss/gitlab.flawfinder.equal-1.mismatch-1.is-permutation-1
rubric: safety
severity: nit
languages: [c]
cwe: [CWE-126]
---

**Rule.** This function is often discouraged by most C++ coding standards in favor of its safer alternatives provided since C++14. Consider using a form of this function: (std::equal, std::mismatch or std::is_permutation) that checks the second iterator before potentially reading past its bounds. For more information please see: https://en.cppreference.com/w/cpp/algorithm

**Why.** Reported as CWE-126. Ported from opengrep rule `gitlab.flawfinder.equal-1.mismatch-1.is_permutation-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.equal-1.mismatch-1.is_permutation-1` (metavariables start with `$`):

- `equal(...)`
- `mismatch(...)`
- `is_permutation(...)`
