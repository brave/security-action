---
name: oss/gitlab.flawfinder.fprintf-1.vfprintf-1.-ftprintf-1.-vftprintf-1.fwprintf-1.fvwpr-1q6bbra
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-134]
---

**Rule.** Format string vulnerabilities allow an attacker to read or in some cases, potentially write data to and from locations in the processes' memory. To prevent against format string attacks, do not allow users or un-validated input to provide the format specification. Consider using a constant for the format specification, or only allow specific characters to be provided to the format argument for the `fprintf` family of functions. For more information please see: https://linux.die.net/man/3/fprintf For more information on format string attacks please see OWASP's attack guide: https://owasp.org/www-community/attacks/Format_string_attack

**Why.** Reported as CWE-134. Ported from opengrep rule `gitlab.flawfinder.fprintf-1.vfprintf-1._ftprintf-1._vftprintf-1.fwprintf-1.fvwprintf-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.fprintf-1.vfprintf-1._ftprintf-1._vftprintf-1.fwprintf-1.fvwprintf-1` (metavariables start with `$`):

- `fprintf($FD, $FMT, ...)`
- `fprintf($FD, "...", ...)`
- `vfprintf($FMT, $ARGS, ...)`
- `vfprintf("...", $ARGS, ...)`
- `_ftprintf($FD, $FMT, ...)`
- `_ftprintf($FD, "...", ...)`
- `fwprintf($FD, $FMT, ...)`
- `fwprintf($FD, "...", ...)`
- `fvwprintf($FD, $FMT, ...)`
- `fvwprintf($FD, "...", ...)`
