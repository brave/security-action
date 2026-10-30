---
name: oss/gitlab.flawfinder.realpath-1
rubric: safety
severity: should_fix
languages: [c, cpp]
cwe: [CWE-120]
---

**Rule.** The `realpath` function should not be called with a destination buffer as it could lead to overflowing if the path is greater than PATH_LEN. It is instead recommended to call `realpath` with the destination buffer set to NULL and use the return value as the resolved path. Be sure to free the returned pointer as realpath will allocate the buffer internally using `malloc`. For more information see: https://linux.die.net/man/3/realpath Example: ``` char const *symlink_path = "/tmp/symlink"; char *resolved_path = NULL; resolved_path = realpath(symlink_path, NULL); if (errno == 0) { // ... use resolved_path... free(resolved_path); } ```

**Why.** Reported as CWE-120. Ported from opengrep rule `gitlab.flawfinder.realpath-1` (generated/oss/audit.yaml).

## Examples

Bad:

```cpp
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.flawfinder.realpath-1` (metavariables start with `$`):

- `realpath(...)`
