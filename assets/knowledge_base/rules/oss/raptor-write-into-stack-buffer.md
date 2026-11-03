---
name: oss/raptor-write-into-stack-buffer
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The software directly writes into a stack buffer. This might lead to a stack-based buffer overflow.

**Why.** See https://cwe.mitre.org/data/definitions/121. See https://github.com/googleprojectzero/weggli. Ported from opengrep rule `raptor-write-into-stack-buffer` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-write-into-stack-buffer` (metavariables start with `$`):

- `$FUN($BUF, ...)`
- `$TYPE $BUF[$LEN];
...
$FUN($BUF, ...);`
- `$FUN($BUF, "...", ...)`
- `strcpy`
- `strncpy`
- `stpcpy`
- `stpncpy`
- `strlcpy`
- `strscpy`
- `wcscpy`
- `wcsncpy`
- `wcpcpy`
- `wcpncpy`
- `wcslcpy`
- `strcat`
- `strncat`
- `strlcat`
- `wcscat`
- `wcsncat`
- `wcslcat`
- `memcpy`
- `memccpy`
- `memmove`
- `memset`
- `wmemcpy`
- `wmemmove`
- `wmemset`
- `$FUN($BUF, $FMT, ...)`
- `$TYPE $BUF[$LEN];
...
$FUN($BUF, $FMT, ...);`
- `(".*%l?s.*"|".*%S.*"|[a-zA-Z_][a-zA-Z0-9_]*)`
- `sprintf`
- `vsprintf`
- `$FUN($BUF, $N, $FMT, ...)`
- `$TYPE $BUF[$LEN];
...
$FUN($BUF, $N, $FMT, ...);`
- `snprintf`
- `vsnprintf`
- `gets`
- `fgets`
- `getwd`
- `getcwd`
- `fread`
- `$FUN($ARG1, $BUF, ...)`
- `$TYPE $BUF[$LEN];
...
$FUN($ARG1, $BUF, ...);`
- `$FUN("...", $BUF, ...)`
- `bcopy`
- `read`
- `pread`
- `recv`
- `recvfrom`
