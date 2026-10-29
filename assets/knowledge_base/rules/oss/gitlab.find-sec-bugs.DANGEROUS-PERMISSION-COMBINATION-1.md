---
name: oss/gitlab.find-sec-bugs.DANGEROUS-PERMISSION-COMBINATION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application was found to permit the `RuntimePermission` of `createClassLoader`, `ReflectPermission` of `suppressAccessChecks`, or both. By granting the `RuntimePermission` of `createClassLoader`, a compromised application could instantiate their own class loaders and load arbitrary classes. By granting the `ReflectPermission` of `suppressAccessChecks` an application will no longer check Java language access checks on fields and methods of a class. This will effectively grant access to protected and private members. For more information on `RuntimePermission` see: https://docs.oracle.com/javase/8/docs/api/java/lang/RuntimePermission.html For more information on `ReflectPermission` see: https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/ReflectPermission.html

**Why.** Reported as CWE-269. Ported from opengrep rule `gitlab.find_sec_bugs.DANGEROUS_PERMISSION_COMBINATION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.DANGEROUS_PERMISSION_COMBINATION-1` (metavariables start with `$`):

- `$RUNVAR = new RuntimePermission("createClassLoader");
...
(PermissionCollection $PC).add($RUNVAR);`
- `$REFVAR = new ReflectPermission("suppressAccessChecks");
...
(PermissionCollection $PC).add($REFVAR);`
- `(PermissionCollection $PC).add(new ReflectPermission("suppressAccessChecks"))`
- `(PermissionCollection $PC).add(new RuntimePermission("createClassLoader"))`
