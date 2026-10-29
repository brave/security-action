---
name: oss/raptor-format-string-bugs
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** The software uses a function that accepts a format string as an argument, but the format string originates from an external source. This can lead to buffer overflows, denial of service, or data representation problems.

**Why.** See https://cwe.mitre.org/data/definitions/134. See https://julianor.tripod.com/bc/formatstring-1.2.pdf. See http://phrack.org/issues/70/13.html#article. See https://g.co/kgs/PCHQjJ. See https://www.sei.cmu.edu/downloads/sei-cert-c-coding-standard-2016-v01.pdf. Ported from opengrep rule `raptor-format-string-bugs` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `raptor-format-string-bugs` (metavariables start with `$`):

- `printf(...)`
- `vprintf(...)`
- `wprintf(...)`
- `vwprintf(...)`
- `vcprintf(...)`
- `vcwprintf(...)`
- `vscprintf(...)`
- `vscwprintf(...)`
- `printk(...)`
- `scanf(...)`
- `vscanf(...)`
- `wscanf(...)`
- `vwscanf(...)`
- `warn(...)`
- `vwarn(...)`
- `warnx(...)`
- `vwarnx(...)`
- `$FUN("...", ...)`
- `fprintf(...)`
- `vfprintf(...)`
- `fwprintf(...)`
- `vfwprintf(...)`
- `sprintf(...)`
- `vsprintf(...)`
- `asprintf(...)`
- `vasprintf(...)`
- `dprintf(...)`
- `vdprintf(...)`
- `wsprintf(...)`
- `fscanf(...)`
- `vfscanf(...)`
- `fwscanf(...)`
- `vfwscanf(...)`
- `sscanf(...)`
- `vsscanf(...)`
- `swscanf(...)`
- `vswscanf(...)`
- `syslog(...)`
- `vsyslog(...)`
- `err(...)`
- `verr(...)`
- `errx(...)`
- `verrx(...)`
- `warnc(...)`
- `vwarnc(...)`
- `$FUN($ARG1, "...", ...)`
- `snprintf(...)`
- `vsnprintf(...)`
- `swprintf(...)`
- `vswprintf(...)`
- `errc(...)`
- `verrc(...)`
- `$FUN($ARG1, $ARG2, "...", ...)`
