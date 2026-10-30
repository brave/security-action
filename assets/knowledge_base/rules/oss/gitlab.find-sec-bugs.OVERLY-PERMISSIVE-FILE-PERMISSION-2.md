---
name: oss/gitlab.find-sec-bugs.OVERLY-PERMISSIVE-FILE-PERMISSION-2
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-732]
---

**Rule.** Overly permissive file permission

**Why.** Reported as CWE-732. Ported from opengrep rule `gitlab.find_sec_bugs.OVERLY_PERMISSIVE_FILE_PERMISSION-2` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.OVERLY_PERMISSIVE_FILE_PERMISSION-2` (metavariables start with `$`):

- `$PERMS.add($P);
...
java.nio.file.Files.setPosixFilePermissions(..., $PERMS);`
- `(PosixFilePermission.){0,1}(OTHERS_)`
