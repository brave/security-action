---
name: oss/gitlab.find-sec-bugs-kotlin.DANGEROUS-PERMISSION-COMBINATION-1
rubric: safety
severity: should_fix
languages: [kotlin]
---

**Rule.** Do not grant dangerous combinations of permissions.

**Why.** Reported as CWE-269. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.DANGEROUS_PERMISSION_COMBINATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$PC.add($PERMISSION)
$REFVAR = $PERMISSION
...;
($PC: PermissionCollection).add($REFVAR)
($PC: PermissionCollection).add($PERMISSION)
ReflectPermission("suppressAccessChecks")
RuntimePermission("createClassLoader")
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.DANGEROUS_PERMISSION_COMBINATION-1` (metavariables start with `$`):

- `$PC = $X.getPermissions(...)
...`
- `$PC.add($PERMISSION)`
- `$REFVAR = $PERMISSION
...;
($PC: PermissionCollection).add($REFVAR)`
- `($PC: PermissionCollection).add($PERMISSION)`
- `ReflectPermission("suppressAccessChecks")`
- `RuntimePermission("createClassLoader")`
