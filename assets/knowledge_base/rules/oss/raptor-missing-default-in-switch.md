---
name: oss/raptor-missing-default-in-switch
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The code does not have a default case in an expression with multiple conditions, such as a switch statement.

**Why.** See https://cwe.mitre.org/data/definitions/478. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. See https://github.com/returntocorp/semgrep/issues/4939. Ported from opengrep rule `raptor-missing-default-in-switch` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
switch ($VAR) { }
```

Good:

```cpp
switch ($VAR) { default: ... }
```

## Detection hints

Literal patterns from opengrep rule `raptor-missing-default-in-switch` (metavariables start with `$`):

- `switch ($VAR) { }`
- `switch ($VAR) { default: ... }`
