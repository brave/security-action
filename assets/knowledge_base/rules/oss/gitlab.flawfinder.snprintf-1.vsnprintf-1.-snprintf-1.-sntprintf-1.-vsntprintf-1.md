---
name: oss/gitlab.flawfinder.snprintf-1.vsnprintf-1.-snprintf-1.-sntprintf-1.-vsntprintf-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-134]
---

**Rule.** Format string vulnerabilities allow an attacker to read or in some cases, potentially write data to and from locations in the processes' memory. To prevent against format string attacks, do not allow users or un-validated input to provide the format specification. Consider using a constant for the format specification, or strip all format specifiers from the input prior to calling the `snprintf` family of functions. Note that some variations of this function do not always null terminate the strings. For more information on using snprintf please see: https://linux.die.net/man/3/snprintf For more information on format string attacks please see OWASP's attack guide: https://owasp.org/www-community/attacks/Format_string_attack

**Why.** Reported as CWE-134. Ported from opengrep rule `gitlab.flawfinder.snprintf-1.vsnprintf-1._snprintf-1._sntprintf-1._vsntprintf-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.snprintf-1.vsnprintf-1._snprintf-1._sntprintf-1._vsntprintf-1` (metavariables start with `$`):

- `snprintf($BUF,$SIZE,$FMT,...)`
- `snprintf($BUF,$SIZE,"...",...)`
- `vsnprintf($BUF,$SIZE,$FMT)`
- `vsnprintf($BUF,$SIZE,"...",...)`
- `_snprintf($BUF,$SIZE,$FMT,...)`
- `_snprintf($BUF,$SIZE,$FMT,"...",...)`
- `_sntprintf($VAR,$FMT,...)`
- `sntprintf($VAR,"...",...)`
- `_vsntprintf($VAR,$FMT,...)`
- `_vsntprintf($VAR,"...",...)`
