---
name: oss/raptor-incorrect-use-of-strncat
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The strncat() function is nearly as dangerous as strcat(), in that it's quite easy to misuse. The first common mistake is supplying the size of the entire buffer instead of the size remaining in the buffer. A more subtle mistake can be made: the size parameter needs to be the amount of space left in the buffer less one; otherwise, the NUL byte is written one byte past the end of the buffer.

**Why.** See https://cwe.mitre.org/data/definitions/787. See https://cwe.mitre.org/data/definitions/193. See https://g.co/kgs/PCHQjJ. Ported from opengrep rule `raptor-incorrect-use-of-strncat` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-incorrect-use-of-strncat` (metavariables start with `$`):

- `strncat($DST, $SRC, $LEN)`
- `$TYPE $DST[$LEN];
...`
- `$TYPE $DST[$LEN] = $EXPR;
...`
- `strncat($DST, $SRC, sizeof($DST))`
- `strncat($DST, $SRC, strlen($DST))`
- `strncat($DST, $SRC, sizeof($DST) - strlen($DST))`
