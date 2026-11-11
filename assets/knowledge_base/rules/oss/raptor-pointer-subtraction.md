---
name: oss/raptor-pointer-subtraction
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software subtracts one pointer from another in order to determine size, but this calculation can be incorrect if the pointers do not exist in the same memory chunk.

**Why.** See https://cwe.mitre.org/data/definitions/469. See https://github.com/struct/mms. Ported from opengrep rule `raptor-pointer-subtraction` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-pointer-subtraction` (metavariables start with `$`):

- `(char * $PTR1) - (char * $PTR2)`
- `(int * $PTR1) - (int * $PTR2)`
- `(float * $PTR1) - (float * $PTR2)`
- `(double * $PTR1) - (double * $PTR2)`
- `$PTR1 - $PTR2`
- `$PTR2 - $PTR1`
- `$TYPE * $PTR1;
$TYPE * $PTR2;
...`
- `$TYPE * $PTR1 = $EXPR1;
$TYPE * $PTR2 = $EXPR2;
...`
- `$TYPE * $PTR1 = $EXPR1;
$TYPE * $PTR2;
...`
- `$TYPE * $PTR1;
$TYPE * $PTR2 = $EXPR2;
...`
- `$TYPE * $PTR3 = $PTR1;
$TYPE * $PTR2;
...`
- `$TYPE * $PTR2;
$TYPE * $PTR3 = $PTR1;
...`
