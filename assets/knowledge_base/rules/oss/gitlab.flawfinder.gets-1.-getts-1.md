---
name: oss/gitlab.flawfinder.gets-1.-getts-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The gets() function reads a line from stdin into the provided buffer until either a terminating newline or EOF. This terminating newline or EOF is replaced with a null byte `'\0'`. No check for buffer overruns are performed so it is recommended to use `fgets()` instead. Do note that some platforms will continue reading data after a `'\0'` is encountered. Usage of `fgets()` is not recommended for reading binary based files or inputs, instead the `read` or `fread` functions should be used. For more information please see: https://linux.die.net/man/3/fgets

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.gets-1._getts-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.gets-1._getts-1` (metavariables start with `$`):

- `gets(...)`
- `_getts(...)`
- `_getws(...)`
