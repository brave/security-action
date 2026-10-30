---
name: oss/gitlab.find-sec-bugs-kotlin.LDAP-ANONYMOUS-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-306]
---

**Rule.** Without proper access control, executing an LDAP statement that contains a user-controlled value can allow an attacker to abuse poorly configured LDAP context

**Why.** Reported as CWE-306. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.LDAP_ANONYMOUS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
$ENV[Context.SECURITY_AUTHENTICATION] = "none"
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.LDAP_ANONYMOUS-1` (metavariables start with `$`):

- `import javax.naming.Context
...`
- `$ENV[Context.SECURITY_AUTHENTICATION] = "none"`
