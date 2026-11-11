---
name: oss/raptor-insecure-api-sprintf-vsprintf
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** A buffer overflow condition exists when a program attempts to put more data in a buffer than it can hold, or when a program attempts to put data in a memory area outside of the boundaries of a buffer.

**Why.** See https://cwe.mitre.org/data/definitions/676. See https://cwe.mitre.org/data/definitions/120. See https://cwe.mitre.org/data/definitions/787. See https://g.co/kgs/PCHQjJ. Ported from opengrep rule `raptor-insecure-api-sprintf-vsprintf` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
sprintf($BUF, $FMT, ...)
vsprintf($BUF, $FMT, ...)
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-sprintf-vsprintf` (metavariables start with `$`):

- `sprintf($BUF, $FMT, ...)`
- `vsprintf($BUF, $FMT, ...)`
- `(".*%l?s.*"|".*%S.*"|[a-zA-Z_][a-zA-Z0-9_]*)`
