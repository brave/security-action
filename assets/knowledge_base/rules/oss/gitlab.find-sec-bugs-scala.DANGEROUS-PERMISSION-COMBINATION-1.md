---
name: oss/gitlab.find-sec-bugs-scala.DANGEROUS-PERMISSION-COMBINATION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-269]
---

**Rule.** Do not grant dangerous combinations of permissions.

**Why.** Reported as CWE-269. Ported from opengrep rule `gitlab.find_sec_bugs_scala.DANGEROUS_PERMISSION_COMBINATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.DANGEROUS_PERMISSION_COMBINATION-1` (metavariables start with `$`):

- `$RUNVAR = new RuntimePermission("createClassLoader");
...
($PC: PermissionCollection).add($RUNVAR);`
- `$REFVAR = new ReflectPermission("suppressAccessChecks");
...
($PC: PermissionCollection).add($REFVAR);`
- `($PC: PermissionCollection).add(new ReflectPermission ("suppressAccessChecks"))`
- `($PC: PermissionCollection).add(new RuntimePermission("createClassLoader"))`
