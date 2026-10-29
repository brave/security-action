---
name: oss/raptor-incorrect-use-of-sprintf-snprintf
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** C standards specify that the results are undefined if a call to sprintf(), snprintf(), vsprintf(), or vsnprintf() would cause copying to take place between objects that overlap (e.g., if the target string array and one of the supplied input arguments refer to the same buffer).

**Why.** See https://linux.die.net/man/3/sprintf. Ported from opengrep rule `raptor-incorrect-use-of-sprintf-snprintf` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-incorrect-use-of-sprintf-snprintf` (metavariables start with `$`):

- `sprintf($DST, ..., $DST, ...)`
- `snprintf($DST, $N, ..., $DST, ...)`
