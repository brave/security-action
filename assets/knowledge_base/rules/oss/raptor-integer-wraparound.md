---
name: oss/raptor-integer-wraparound
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software performs a calculation that can produce an integer overflow or wraparound, when the logic assumes that the resulting value will always be larger than the original value. This can introduce other weaknesses when the calculation is used for resource management or execution control.

**Why.** See https://cwe.mitre.org/data/definitions/190. See https://cwe.mitre.org/data/definitions/128. See https://cwe.mitre.org/data/definitions/131. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. See http://www.phrack.org/issues/60/10.html#article. See https://docs.microsoft.com/en-us/cpp/sanitizers/asan-error-examples. See https://dustri.org/b/playing-with-weggli.html. Ported from opengrep rule `raptor-integer-wraparound` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-integer-wraparound` (metavariables start with `$`):

- `$FUN($X * $Y)`
- `malloc`
- `valloc`
- `$FUN($N)`
- `$N = $X * $Y;
...`
- `$FUN($X + $Y)`
- `$N = $X + $Y;
...`
- `$FUN($ARG1, $X * $Y)`
- `calloc`
- `realloc`
- `reallocf`
- `aligned_alloc`
- `$FUN($ARG1, $N)`
- `$FUN($ARG1, $X + $Y)`
- `$X > $MAX || ($X + $Y) > $MAX`
- `$X >= $MAX || ($X + $Y) > $MAX`
- `$X > $MAX || ($X + $Y) >= $MAX`
- `$X >= $MAX || ($X + $Y) >= $MAX`
- `$X < $MAX && ($X + $Y) < $MAX`
- `$X <= $MAX && ($X + $Y) < $MAX`
- `$X < $MAX && ($X + $Y) <= $MAX`
- `$X <= $MAX && ($X + $Y) <= $MAX`
- `$X > $MAX || ($X * $Y) > $MAX`
- `$X >= $MAX || ($X * $Y) > $MAX`
- `$X > $MAX || ($X * $Y) >= $MAX`
- `$X >= $MAX || ($X * $Y) >= $MAX`
- `$X < $MAX && ($X * $Y) < $MAX`
- `$X <= $MAX && ($X * $Y) < $MAX`
- `$X < $MAX && ($X * $Y) <= $MAX`
- `$X <= $MAX && ($X * $Y) <= $MAX`
