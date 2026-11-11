---
name: oss/raptor-incorrect-use-of-sizeof
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The code calls sizeof() on a malloced pointer type, which always returns the wordsize/8. This can produce an unexpected result if the programmer intended to determine how much memory has been allocated.

**Why.** See https://cwe.mitre.org/data/definitions/467. See https://g.co/kgs/PCHQjJ. See https://github.com/struct/mms. See https://dustri.org/b/playing-with-weggli.html. Ported from opengrep rule `raptor-incorrect-use-of-sizeof` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-incorrect-use-of-sizeof` (metavariables start with `$`):

- `sizeof((char * $PTR))`
- `sizeof("...")`
- `sizeof((int * $PTR))`
- `sizeof((float * $PTR))`
- `sizeof((double * $PTR))`
- `sizeof($PTR)`
- `$TYPE * $PTR;
...`
- `$TYPE * $PTR = $EXPR;
...`
