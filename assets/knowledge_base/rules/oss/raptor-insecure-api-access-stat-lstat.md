---
name: oss/raptor-insecure-api-access-stat-lstat
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software checks the state of a resource before using it, but the resource's state can change between the check and the use in a way that invalidates the results of the check. This canmcause the software to perform invalid actions when the resource is inman unexpected state.

**Why.** See https://cwe.mitre.org/data/definitions/367. See https://g.co/kgs/PCHQjJ. Ported from opengrep rule `raptor-insecure-api-access-stat-lstat` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-access-stat-lstat` (metavariables start with `$`):

- `access(...)`
- `stat(...)`
- `lstat(...)`
