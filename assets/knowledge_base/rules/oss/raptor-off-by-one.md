---
name: oss/raptor-off-by-one
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software calculates or uses an incorrect maximum or minimum value that is 1 more, or 1 less, than the correct value.

**Why.** See https://cwe.mitre.org/data/definitions/193. See https://cwe.mitre.org/data/definitions/787. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. Ported from opengrep rule `raptor-off-by-one` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-off-by-one` (metavariables start with `$`):

- `$BUF[sizeof($BUF)] = $EXPR`
- `$BUF[$LEN] = $EXPR`
- `$TYPE $BUF[$LEN];
...
$BUF[$LEN] = $EXPR;`
- `*($BUF + $LEN) = $EXPR`
- `$TYPE $BUF[$LEN];
...
*($BUF + $LEN) = $EXPR;`
- `$BUF[$X][$Y] = $EXPR`
- `$TYPE $BUF[$A][$Y];
...
$BUF[$X][$Y] = $EXPR;`
- `$TYPE $BUF[$X][$B];
...
$BUF[$X][$Y] = $EXPR;`
- `strlen($SRC) > sizeof($DST)`
- `strlen($SRC) <= sizeof($DST)`
- `sizeof($DST) < strlen($SRC)`
- `sizeof($DST) >= strlen($SRC)`
- `strncat($DST, $SRC, $LEN)`
- `$VAL - 1`
- `$STR[strlen($STR) - 1]`
- `malloc(strlen($STR))`
