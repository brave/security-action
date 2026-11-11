---
name: oss/raptor-incorrect-use-of-strncpy-stpncpy-strlcpy
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software uses the size of a source buffer when reading from or writing to a destination buffer, which may cause it to access memory that is outside of the bounds of the buffer.

**Why.** See https://cwe.mitre.org/data/definitions/806. See https://github.com/0xdea/advisories/blob/master/2020-07-solaris-whodo-w.txt. See https://dustri.org/b/playing-with-weggli.html. Ported from opengrep rule `raptor-incorrect-use-of-strncpy-stpncpy-strlcpy` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-incorrect-use-of-strncpy-stpncpy-strlcpy` (metavariables start with `$`):

- `$FUN($DST, $SRC, $LEN)`
- `strncpy`
- `stpncpy`
- `strlcpy`
- `strscpy`
- `$TYPE $SRC[$LEN];
...`
- `$TYPE $SRC[$LEN] = $EXPR;
...`
- `$FUN($DST, $SRC, <... $SRC ...>)`
