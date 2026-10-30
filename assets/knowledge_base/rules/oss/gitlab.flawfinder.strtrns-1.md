---
name: oss/gitlab.flawfinder.strtrns-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** This function is easy to misuse by not accounting for the space necessary when transforming strings. Ensure that the destination buffer is large enough to fit the transformed output. For more information please see: https://docs.oracle.com/cd/E36784_01/html/E36877/strtrns-3gen.html

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.strtrns-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.strtrns-1` (metavariables start with `$`):

- `strtrns(...)`
