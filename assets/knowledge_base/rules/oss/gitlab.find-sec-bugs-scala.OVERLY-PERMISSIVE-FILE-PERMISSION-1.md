---
name: oss/gitlab.find-sec-bugs-scala.OVERLY-PERMISSIVE-FILE-PERMISSION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-732]
---

**Rule.** Overly permissive file permission

**Why.** Reported as CWE-732. Ported from opengrep rule `gitlab.find_sec_bugs_scala.OVERLY_PERMISSIVE_FILE_PERMISSION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
java.nio.file.Files.setPosixFilePermissions(..., java.nio.file.attribute.PosixFilePermissions.fromString("$PERM_STRING"));
$PERMISSIONS = java.nio.file.attribute.PosixFilePermissions.fromString("$PERM_STRING");
...
java.nio.file.Files.setPosixFilePermissions(..., $PERMISSIONS);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.OVERLY_PERMISSIVE_FILE_PERMISSION-1` (metavariables start with `$`):

- `java.nio.file.Files.setPosixFilePermissions(..., java.nio.file.attribute.PosixFilePermissions.fromString("$PERM_STRING"));`
- `$PERMISSIONS = java.nio.file.attribute.PosixFilePermissions.fromString("$PERM_STRING");
...
java.nio.file.Files.setPosixFilePermissions(..., $PERMISSIONS);`
- `[rwx-]{6}[rwx]{1,}`
