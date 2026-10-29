---
name: oss/raptor-incorrect-use-of-memset
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The invocation of memset() is easy to get wrong. The second argument is the character and the third argument is the size, but sometimes these arguments are in the wrong order. This results in a no-op.

**Why.** See https://lkml.org/lkml/2009/11/11/336. See https://bugs.mysql.com/bug.php?id=23181. Ported from opengrep rule `raptor-incorrect-use-of-memset` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-incorrect-use-of-memset` (metavariables start with `$`):

- `memset($S, $C, 0);`
- `memset($S, $C, '\0');`
- `memset($S, sizeof(...), $N);`
- `memset_explicit($S, $C, 0);`
- `memset_explicit($S, $C, '\0');`
- `memset_explicit($S, sizeof(...), $N);`
