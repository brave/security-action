---
name: oss/raptor-unsafe-ret-strlcpy-strlcat
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The strlcpy() and strlcat() functions return the total length of the string they tried to create. For strlcpy() that means the length of the source string. For strlcat() that means the initial length of the destination string plus the length of of the source string. Therefore, this return value can be larger than the size of the destination buffer. If it is used unsafely, e.g. as an index to write to the destination buffer, memory corruption might occur.

**Why.** See https://lwn.net/Articles/507319/. See https://g.co/kgs/PCHQjJ. Ported from opengrep rule `raptor-unsafe-ret-strlcpy-strlcat` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-unsafe-ret-strlcpy-strlcat` (metavariables start with `$`):

- `$RET = strlcpy(...)`
- `$RET = strlcat(...)`
- `$RET = wcslcpy(...)`
- `$RET = wcslcat(...)`
- `$RET += strlcpy(...)`
- `$RET += strlcat(...)`
- `$RET += wcslcpy(...)`
- `$RET += wcslcat(...)`
