---
name: oss/raptor-unterminated-string-strncpy-stpncpy
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** If there is no NUL character byte in the first n bytes of the source string, strncpy() and stpncpy() do not NUL-terminate the destination buffer. If the program does not explicitly terminate the destination buffer, this will almost certainly result in information disclosure, and possibly a buffer overflow condition.

**Why.** See https://cwe.mitre.org/data/definitions/170. See https://cwe.mitre.org/data/definitions/126. See https://g.co/kgs/PCHQjJ. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-unterminated-string-strncpy-stpncpy` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
$FUN(...)
strncpy
stpncpy
wcsncpy
wcpncpy
```

Good:

```cpp
$FUN($DST, $SRC, $N);
...
$DST[$POS] = NULL;
$FUN($DST, $SRC, $N);
...
$DST[$POS] = '\0';
$FUN($DST, $SRC, $N);
...
$DST[$POS] = 0;
```

## Detection hints

Literal patterns from opengrep rule `raptor-unterminated-string-strncpy-stpncpy` (metavariables start with `$`):

- `$FUN(...)`
- `strncpy`
- `stpncpy`
- `wcsncpy`
- `wcpncpy`
- `$FUN($DST, $SRC, $N);
...
$DST[$POS] = NULL;`
- `$FUN($DST, $SRC, $N);
...
$DST[$POS] = '\0';`
- `$FUN($DST, $SRC, $N);
...
$DST[$POS] = 0;`
