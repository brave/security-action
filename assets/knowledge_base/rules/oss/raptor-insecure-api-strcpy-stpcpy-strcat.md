---
name: oss/raptor-insecure-api-strcpy-stpcpy-strcat
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** A buffer overflow condition exists when a program attempts to put more data in a buffer than it can hold, or when a program attempts to put data in a memory area outside of the boundaries of a buffer.

**Why.** See https://cwe.mitre.org/data/definitions/676. See https://cwe.mitre.org/data/definitions/120. See https://cwe.mitre.org/data/definitions/787. See https://g.co/kgs/PCHQjJ. Ported from opengrep rule `raptor-insecure-api-strcpy-stpcpy-strcat` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
strcpy(...)
stpcpy(...)
strcat(...)
wcscpy(...)
wcpcpy(...)
wcscat(...)
```

Good:

```cpp
$FUN($BUF, "...", ...)
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-strcpy-stpcpy-strcat` (metavariables start with `$`):

- `strcpy(...)`
- `stpcpy(...)`
- `strcat(...)`
- `wcscpy(...)`
- `wcpcpy(...)`
- `wcscat(...)`
- `$FUN($BUF, "...", ...)`
