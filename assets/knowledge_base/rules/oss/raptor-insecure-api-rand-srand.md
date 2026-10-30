---
name: oss/raptor-insecure-api-rand-srand
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The rand() PRNG should not be used in applications intended to be portable when good randomness is needed. Instead, the use of random() is recommended.

**Why.** See https://cwe.mitre.org/data/definitions/338. See https://cwe.mitre.org/data/definitions/330. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-insecure-api-rand-srand` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-rand-srand` (metavariables start with `$`):

- `rand(...)`
- `srand(...)`
