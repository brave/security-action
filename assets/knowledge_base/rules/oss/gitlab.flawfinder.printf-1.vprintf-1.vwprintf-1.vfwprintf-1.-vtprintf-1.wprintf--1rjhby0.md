---
name: oss/gitlab.flawfinder.printf-1.vprintf-1.vwprintf-1.vfwprintf-1.-vtprintf-1.wprintf--1rjhby0
rubric: safety
severity: should_fix
languages: [c, cpp]
---

**Rule.** Format string vulnerabilities allow an attacker to read or in some cases, potentially write data to and from locations in the processes' memory. To prevent against format string attacks, do not allow users or un-validated input to provide the format specification. Consider using a constant for the format specification, or only allow specific characters to be provided to the format argument for the `printf` family of functions. For more information please see: https://linux.die.net/man/3/fprintf For more information on format string attacks please see OWASP's attack guide: https://owasp.org/www-community/attacks/Format_string_attack

**Why.** Reported as CWE-134. Ported from opengrep rule `gitlab.flawfinder.printf-1.vprintf-1.vwprintf-1.vfwprintf-1._vtprintf-1.wprintf-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.printf-1.vprintf-1.vwprintf-1.vfwprintf-1._vtprintf-1.wprintf-1` (metavariables start with `$`):

- `printf(...)`
- `printf("...",...)`
- `vprintf($FMT, ...)`
- `vprintf("...", ...)`
- `vwprintf($FMT, ...)`
- `vwprintf("...", ...)`
- `vfwprintf($FILE, $FMT, ...)`
- `vfwprintf($FILE, "...", ...)`
- `_vtprintf($FILE, $FMT, ...)`
- `_vtprintf($FILE, "...", ...)`
- `wprintf($FMT, ...)`
- `wprintf("...", ...)`
