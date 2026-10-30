---
name: oss/raptor-insecure-api-gets
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The gets() function is always unsafe because it does not perform bounds checking on the size of its input. An attacker can easily send arbitrarily-sized input to gets() and overflow the destination buffer.

**Why.** See https://cwe.mitre.org/data/definitions/242. See https://cwe.mitre.org/data/definitions/120. Ported from opengrep rule `raptor-insecure-api-gets` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-gets` (metavariables start with `$`):

- `gets(...)`
