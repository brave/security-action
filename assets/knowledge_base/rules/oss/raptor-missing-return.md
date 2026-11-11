---
name: oss/raptor-missing-return
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** A non-void function does not have a return statement. Hence, its return value can be considered undefined.

**Why.** See https://cwe.mitre.org/data/definitions/393. See https://cwe.mitre.org/data/definitions/394. Ported from opengrep rule `raptor-missing-return` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
$TYPE $FUN($ARG, ...) { ... }
```

Good:

```cpp
$TYPE $FUN(...);
$TYPE $FUN(...) { ... return $RET; }
int main(...) { ... }
void $FUN(...) { ... }
```

## Detection hints

Literal patterns from opengrep rule `raptor-missing-return` (metavariables start with `$`):

- `$TYPE $FUN($ARG, ...) { ... }`
- `$TYPE $FUN(...);`
- `$TYPE $FUN(...) { ... return $RET; }`
- `int main(...) { ... }`
- `void $FUN(...) { ... }`
