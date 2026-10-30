---
name: oss/gitlab.flawfinder.fscanf-1.sscanf-1.vsscanf-1.vfscanf-1.-ftscanf-1.fwscanf-1.vfw-1wrqgff
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** Format specifiers can take optional field widths, which should be used to limit how many characters are copied into the target buffer. Example: ``` const char str[20] = "AAAAAAAAAAAAAAAAAAA"; char buf[11] = {0}; sscanf(str, "%10s", &buf); // buf = AAAAAAAAAA\0 ```

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.fscanf-1.sscanf-1.vsscanf-1.vfscanf-1._ftscanf-1.fwscanf-1.vfwscanf-1.vswscanf-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.fscanf-1.sscanf-1.vsscanf-1.vfscanf-1._ftscanf-1.fwscanf-1.vfwscanf-1.vswscanf-1` (metavariables start with `$`):

- `fscanf(...)`
- `sscanf(...)`
- `vsscanf(...)`
- `vfscanf(...)`
- `_ftscanf(...)`
- `fwscanf(...)`
- `vfwscanf(...)`
- `vswscanf(...)`
