---
name: oss/raptor-unsafe-ret-snprintf-vsnprintf
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The snprintf() and vsnprintf() functions return the total length of the string they tried to create. Therefore, this return value can be larger than the size of the destination buffer. If it is used unsafely, e.g. as an index to write to the destination buffer, memory corruption might occur.

**Why.** See https://lwn.net/Articles/507319/. See https://g.co/kgs/PCHQjJ. See https://dustri.org/b/playing-with-weggli.html. Ported from opengrep rule `raptor-unsafe-ret-snprintf-vsnprintf` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-unsafe-ret-snprintf-vsnprintf` (metavariables start with `$`):

- `$RET = snprintf(...)`
- `$RET = vsnprintf(...)`
- `$RET += snprintf(...)`
- `$RET += vsnprintf(...)`
