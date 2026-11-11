---
name: oss/raptor-insecure-api-signal
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The signal() API should be regarded as deprecated. When possible, sigaction() should be used instead, because it allows to precisely specify the desired behavior in case two signals arrive shortly after each other thus preventing many race conditions.

**Why.** See https://cwe.mitre.org/data/definitions/364. See https://cwe.mitre.org/data/definitions/479. See https://cwe.mitre.org/data/definitions/828. Ported from opengrep rule `raptor-insecure-api-signal` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-signal` (metavariables start with `$`):

- `signal(...)`
