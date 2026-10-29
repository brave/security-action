---
name: oss/gitlab.flawfinder.atoi-1.atol-1.-wtoi-1.-wtoi64-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The `atoi` family of functions can potentially overflow or underflow integer values. Consider using `stroul` instead. For more information please see: https://wiki.sei.cmu.edu/confluence/display/c/ERR34-C.+Detect+errors+when+converting+a+string+to+a+number

**Why.** Reported as CWE-190. Ported from opengrep rule `gitlab.flawfinder.atoi-1.atol-1._wtoi-1._wtoi64-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.atoi-1.atol-1._wtoi-1._wtoi64-1` (metavariables start with `$`):

- `atoi(...)`
- `atol(...)`
- `_wtoi(...)`
- `_wtoi64(...)`
