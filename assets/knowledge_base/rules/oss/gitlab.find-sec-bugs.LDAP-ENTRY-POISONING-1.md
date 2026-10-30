---
name: oss/gitlab.find-sec-bugs.LDAP-ENTRY-POISONING-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-20]
---

**Rule.** Without proper access control, executing an LDAP statement that contains a user-controlled value can allow an attacker to abuse poorly configured LDAP context

**Why.** Reported as CWE-20. Ported from opengrep rule `gitlab.find_sec_bugs.LDAP_ENTRY_POISONING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
new javax.naming.directory.SearchControls($SCOPE, $CLIMIT, $TLIMIT, $ATTR, true, $DEREF)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.LDAP_ENTRY_POISONING-1` (metavariables start with `$`):

- `new javax.naming.directory.SearchControls($SCOPE, $CLIMIT, $TLIMIT, $ATTR, true, $DEREF)`
