---
name: oss/gitlab.flawfinder.streadd-1.strecpy-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The `strecpy` and `streadd` functions require that the destination buffer size be at least four times the size of the source due to each character potentially becoming a `\` and 3 digits. For more information please see: https://docs.oracle.com/cd/E18752_01/html/816-5172/streadd-3gen.html

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.streadd-1.strecpy-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.streadd-1.strecpy-1` (metavariables start with `$`):

- `streadd(...)`
- `strecpy(...)`
