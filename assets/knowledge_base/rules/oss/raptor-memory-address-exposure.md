---
name: oss/raptor-memory-address-exposure
rubric: safety
severity: nit
languages: [c, cpp]
---

**Rule.** The software generates an error message that includes sensitive information about its environment, users, or associated data. In particular, exposure of memory addresses might defeat ASLR.

**Why.** See https://cwe.mitre.org/data/definitions/200. See https://cwe.mitre.org/data/definitions/209. See https://cwe.mitre.org/data/definitions/497. See https://github.com/struct/mms. Ported from opengrep rule `raptor-memory-address-exposure` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
printf($FMT, ...)
vprintf($FMT, ...)
wprintf($FMT, ...)
vwprintf($FMT, ...)
vcprintf($FMT, ...)
vcwprintf($FMT, ...)
vscprintf($FMT, ...)
vscwprintf($FMT, ...)
fprintf($ARG1, $FMT, ...)
vfprintf($ARG1, $FMT, ...)
fwprintf($ARG1, $FMT, ...)
vfwprintf($ARG1, $FMT, ...)
sprintf($ARG1, $FMT, ...)
vsprintf($ARG1, $FMT, ...)
asprintf($ARG1, $FMT, ...)
vasprintf($ARG1, $FMT, ...)
dprintf($ARG1, $FMT, ...)
vdprintf($ARG1, $FMT, ...)
wsprintf($ARG1, $FMT, ...)
snprintf($ARG1, $ARG2, $FMT, ...)
vsnprintf($ARG1, $ARG2, $FMT, ...)
swprintf($ARG1, $ARG2, $FMT, ...)
vswprintf($ARG1, $ARG2, $FMT, ...)
```

## Detection hints

Literal patterns from opengrep rule `raptor-memory-address-exposure` (metavariables start with `$`):

- `printf($FMT, ...)`
- `vprintf($FMT, ...)`
- `wprintf($FMT, ...)`
- `vwprintf($FMT, ...)`
- `vcprintf($FMT, ...)`
- `vcwprintf($FMT, ...)`
- `vscprintf($FMT, ...)`
- `vscwprintf($FMT, ...)`
- `fprintf($ARG1, $FMT, ...)`
- `vfprintf($ARG1, $FMT, ...)`
- `fwprintf($ARG1, $FMT, ...)`
- `vfwprintf($ARG1, $FMT, ...)`
- `sprintf($ARG1, $FMT, ...)`
- `vsprintf($ARG1, $FMT, ...)`
- `asprintf($ARG1, $FMT, ...)`
- `vasprintf($ARG1, $FMT, ...)`
- `dprintf($ARG1, $FMT, ...)`
- `vdprintf($ARG1, $FMT, ...)`
- `wsprintf($ARG1, $FMT, ...)`
- `snprintf($ARG1, $ARG2, $FMT, ...)`
- `vsnprintf($ARG1, $ARG2, $FMT, ...)`
- `swprintf($ARG1, $ARG2, $FMT, ...)`
- `vswprintf($ARG1, $ARG2, $FMT, ...)`
- `(".*%\w*x.*"|".*%\w*X.*"|".*%\w*p.*")`
