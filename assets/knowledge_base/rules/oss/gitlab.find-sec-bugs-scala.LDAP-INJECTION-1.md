---
name: oss/gitlab.find-sec-bugs-scala.LDAP-INJECTION-1
rubric: safety
severity: should_fix
languages: [scala]
cwe: [CWE-90]
---

**Rule.** Just like SQL, all inputs passed to an LDAP query need to be passed in safely. Unfortunately, LDAP doesn't have prepared statement interfaces like SQL. Therefore, the primary defense against LDAP injection is strong input validation of any untrusted data before including it in an LDAP query.

**Why.** Reported as CWE-90. Ported from opengrep rule `gitlab.find_sec_bugs_scala.LDAP_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
($P: java.util.Properties).put($KEY, $VAR)
$CTX.lookup(..., $VAR, ...)
$CTX.search(..., $VAR, ...)
$CTX.list(..., $VAR, ...)
($CTX: javax.naming.directory.DirContext)
($CTX: javax.naming.directory.Context)
($CTX: javax.naming.Context)
($CTX: javax.naming.directory.InitialDirContext)
($CTX: javax.naming.ldap.LdapContext)
($CTX: com.unboundid.ldap.sdk.LDAPConnection)
($CTX: javax.naming.event.EventDirContext)
($CTX: com.sun.jndi.ldap.LdapCtx)
($CTX: org.springframework.ldap.core.LdapTemplate)
($CTX: org.springframework.ldap.core.LdapOperations)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.LDAP_INJECTION-1` (metavariables start with `$`):

- `def $FUNC(..., $VAR: String, ...): $TYPE = {
  ...
}`
- `def $FUNC(..., $X: String, ...): $TYPE = {
  ...
  $VAR = ... + $X;
  ...
}`
- `($P: java.util.Properties).put($KEY, $VAR)`
- `$CTX.lookup(..., $VAR, ...)`
- `$CTX.search(..., $VAR, ...)`
- `$CTX.list(..., $VAR, ...)`
- `($CTX: javax.naming.directory.DirContext)`
- `($CTX: javax.naming.directory.Context)`
- `($CTX: javax.naming.Context)`
- `($CTX: javax.naming.directory.InitialDirContext)`
- `($CTX: javax.naming.ldap.LdapContext)`
- `($CTX: com.unboundid.ldap.sdk.LDAPConnection)`
- `($CTX: javax.naming.event.EventDirContext)`
- `($CTX: com.sun.jndi.ldap.LdapCtx)`
- `($CTX: org.springframework.ldap.core.LdapTemplate)`
- `($CTX: org.springframework.ldap.core.LdapOperations)`
