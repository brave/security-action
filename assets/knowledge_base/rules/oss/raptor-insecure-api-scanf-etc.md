---
name: oss/raptor-insecure-api-scanf-etc
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** A buffer overflow condition exists when a program attempts to put more data in a buffer than it can hold, or when a program attempts to put data in a memory area outside of the boundaries of a buffer.

**Why.** See https://cwe.mitre.org/data/definitions/676. See https://cwe.mitre.org/data/definitions/120. See https://cwe.mitre.org/data/definitions/787. See https://g.co/kgs/PCHQjJ. Ported from opengrep rule `raptor-insecure-api-scanf-etc` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
scanf($FMT, ...)
vscanf($FMT, ...)
fscanf($FS, $FMT, ...)
vfscanf($FS, $FMT, ...)
sscanf($BUF, $FMT, ...)
vsscanf($BUF, $FMT, ...)
wscanf($FMT, ...)
vwscanf($FMT, ...)
fwscanf($FS, $FMT, ...)
vfwscanf($FS, $FMT, ...)
swscanf($BUF, $FMT, ...)
vswscanf($BUF, $FMT, ...)
```

## Detection hints

Literal patterns from opengrep rule `raptor-insecure-api-scanf-etc` (metavariables start with `$`):

- `scanf($FMT, ...)`
- `vscanf($FMT, ...)`
- `fscanf($FS, $FMT, ...)`
- `vfscanf($FS, $FMT, ...)`
- `sscanf($BUF, $FMT, ...)`
- `vsscanf($BUF, $FMT, ...)`
- `wscanf($FMT, ...)`
- `vwscanf($FMT, ...)`
- `fwscanf($FS, $FMT, ...)`
- `vfwscanf($FS, $FMT, ...)`
- `swscanf($BUF, $FMT, ...)`
- `vswscanf($BUF, $FMT, ...)`
- `(".*%l?s.*"|".*%S.*"|[a-zA-Z_][a-zA-Z0-9_]*)`
