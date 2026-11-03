---
name: oss/raptor-insecure-api-mktemp-tmpnam-tempnam
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Creating and using insecure temporary files can leave application and system data vulnerable to attack.

**Why.** See https://cwe.mitre.org/data/definitions/377. See https://cwe.mitre.org/data/definitions/367. Ported from opengrep rule `raptor-insecure-api-mktemp-tmpnam-tempnam` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-mktemp-tmpnam-tempnam` (metavariables start with `$`):

- `mktemp(...)`
- `tmpnam(...)`
- `tempnam(...)`
