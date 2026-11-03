---
name: oss/raptor-incorrect-use-of-free
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software calls free() on a pointer to memory that has a short lifetime and was not allocated using associated heap allocation functions such as malloc(), calloc(), or realloc().

**Why.** See https://cwe.mitre.org/data/definitions/590. See https://github.com/shellphish/how2heap/blob/master/glibc_2.23/house_of_spirit.c. Ported from opengrep rule `raptor-incorrect-use-of-free` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-incorrect-use-of-free` (metavariables start with `$`):

- `free($PTR)`
- `$TYPE $PTR[$LEN];
...`
- `$TYPE $PTR[$LEN] = $EXPR;
...`
- `$TYPE $ARR[$LEN];
...
$PTR = $ARR;
...`
- `$TYPE $ARR[$LEN] = $EXPR;
...
$PTR = $ARR;
...`
- `free(&$VAR)`
- `$TYPE $VAR;
...`
- `$TYPE $VAR = $EXPR;
...`
- `$TYPE $VAR[$LEN];
...`
- `$TYPE $VAR[$LEN] = $EXPR;
...`
- `$TYPE * $VAR;
...`
- `$TYPE * $VAR = $EXPR;
...`
