---
name: oss/gitlab.flawfinder.strccpy-1.strcadd-1
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The `strccpy` and `strcadd` functions do not allow the caller to check that the destination size of the buffer will fit the input buffer prior to copying. For more information please see: https://docs.oracle.com/cd/E18752_01/html/816-5172/streadd-3gen.html

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.strccpy-1.strcadd-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.strccpy-1.strcadd-1` (metavariables start with `$`):

- `strccpy(...)`
- `strcadd(...)`
