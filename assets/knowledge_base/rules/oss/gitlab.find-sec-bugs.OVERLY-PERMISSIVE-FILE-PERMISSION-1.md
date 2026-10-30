---
name: oss/gitlab.find-sec-bugs.OVERLY-PERMISSIVE-FILE-PERMISSION-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-732]
---

**Rule.** The application was found setting file permissions to overly permissive values. Consider using the following values if the application user is the only process to access the file: - `r--` - read only access to the file - `w--` - write only access to the file - `rw-` - read/write access to the file Example setting read/write permissions for only the owner of a `Path`: ``` // Get a reference to the path Path path = Paths.get("/tmp/somefile"); // Create a PosixFilePermission set from java.nio.file.attribute Set<PosixFilePermission> permissions = java.nio.file.attribute.PosixFilePermissions.fromString("rw-------"); // Set the permissions java.nio.file.Files.setPosixFilePermissions(path, permissions); ``` For all other values please see: https://en.wikipedia.org/wiki/File-system_permissions#Symbolic_notation

**Why.** Reported as CWE-732. Ported from opengrep rule `gitlab.find_sec_bugs.OVERLY_PERMISSIVE_FILE_PERMISSION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
java.nio.file.Files.setPosixFilePermissions(..., java.nio.file.attribute.PosixFilePermissions.fromString("$PERM_STRING"));
$PERMISSIONS = java.nio.file.attribute.PosixFilePermissions.fromString("$PERM_STRING");
...
java.nio.file.Files.setPosixFilePermissions(..., $PERMISSIONS);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.OVERLY_PERMISSIVE_FILE_PERMISSION-1` (metavariables start with `$`):

- `java.nio.file.Files.setPosixFilePermissions(..., java.nio.file.attribute.PosixFilePermissions.fromString("$PERM_STRING"));`
- `$PERMISSIONS = java.nio.file.attribute.PosixFilePermissions.fromString("$PERM_STRING");
...
java.nio.file.Files.setPosixFilePermissions(..., $PERMISSIONS);`
- `[rwx-]{6}[rwx]{1,}`
