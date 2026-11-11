---
name: oss/gitlab.find-sec-bugs-scala.OVERLY-PERMISSIVE-FILE-PERMISSION-2
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-732]
---

**Rule.** Overly permissive file permission

**Why.** Reported as CWE-732. Ported from opengrep rule `gitlab.find_sec_bugs_scala.OVERLY_PERMISSIVE_FILE_PERMISSION-2` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$PERMS.add($P);
$A = $B + $P;
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.OVERLY_PERMISSIVE_FILE_PERMISSION-2` (metavariables start with `$`):

- `...
java.nio.file.Files.setPosixFilePermissions(..., $PERMS);`
- `$PERMS.add($P);`
- `$A = $B + $P;`
- `(PosixFilePermission.){0,1}(OTHERS_)`
