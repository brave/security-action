---
name: oss/gitlab.find-sec-bugs-kotlin.LDAP-INJECTION-1
rubric: safety
severity: should_fix
languages: [kotlin]
cwe: [CWE-90]
---

**Rule.** Just like SQL, all inputs passed to an LDAP query need to be passed in safely. Unfortunately, LDAP doesn't have prepared statement interfaces like SQL. Therefore, the primary defense against LDAP injection is strong input validation of any untrusted data before including it in an LDAP query.

**Why.** Reported as CWE-90. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs_kotlin.LDAP_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
// untrusted input (source)
$VAR
// flows to sink without sanitization
javax.naming.ldap.LdapName(...)
($C: javax.naming.directory.Context).lookup(...)
($C: javax.naming.Context).lookup(...)
$QUERY
$CTX.lookup(...)
$FILTER
($C: DirContext)
($IDC: InitialDirContext)
($LC: LdapContext)
($EDC: EventDirContext)
($LC: LdapCtx)
($C: javax.naming.directory.DirContext)
($IDC: javax.naming.directory.InitialDirContext)
($LC: javax.naming.ldap.LdapContext)
($EDC: javax.naming.event.EventDirContext)
($LC: com.sun.jndi.ldap.LdapCtx)
$CTX = DirContext(...);...
$CTX = InitialDirContext(...);...
$CTX = LdapContext(...);...
$CTX = EventDirContext(...);...
$CTX = LdapCtx(...);...
$CTX = javax.naming.directory.DirContext(...);...
$CTX = javax.naming.directory.InitialDirContext(...);...
$CTX = javax.naming.ldap.LdapContext(...);...
$CTX = javax.naming.event.EventDirContext(...);...
$CTX = com.sun.jndi.ldap.LdapCtx(...);...
($LT: LdapTemplate)
($LO: LdapOperations)
($LT: org.springframework.ldap.core.LdapTemplate)
($LO: org.springframework.ldap.core.LdapOperations)
$CTX = LdapTemplate(...);...
$CTX = LdapOperations(...);...
$CTX = org.springframework.ldap.core.LdapTemplate(...);...
$CTX = org.springframework.ldap.core.LdapOperations(...);...
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_kotlin.LDAP_INJECTION-1` (metavariables start with `$`):

- `javax.naming.ldap.LdapName(...)`
- `($C: javax.naming.directory.Context).lookup(...)`
- `($C: javax.naming.Context).lookup(...)`
- `($C: com.unboundid.ldap.sdk.LDAPConnection).search($QUERY, ...)`
- `$QUERY`
- `$CTX.lookup(...)`
- `$CTX.search($QUERY, ...)`
- `$CTX.search($NAME, $FILTER, ...)`
- `$FILTER`
- `($C: DirContext)`
- `($IDC: InitialDirContext)`
- `($LC: LdapContext)`
- `($EDC: EventDirContext)`
- `($LC: LdapCtx)`
- `($C: javax.naming.directory.DirContext)`
- `($IDC: javax.naming.directory.InitialDirContext)`
- `($LC: javax.naming.ldap.LdapContext)`
- `($EDC: javax.naming.event.EventDirContext)`
- `($LC: com.sun.jndi.ldap.LdapCtx)`
- `$CTX = DirContext(...);...`
- `$CTX = InitialDirContext(...);...`
- `$CTX = LdapContext(...);...`
- `$CTX = EventDirContext(...);...`
- `$CTX = LdapCtx(...);...`
- `$CTX = javax.naming.directory.DirContext(...);...`
- `$CTX = javax.naming.directory.InitialDirContext(...);...`
- `$CTX = javax.naming.ldap.LdapContext(...);...`
- `$CTX = javax.naming.event.EventDirContext(...);...`
- `$CTX = com.sun.jndi.ldap.LdapCtx(...);...`
- `$CTX.list($QUERY, ...)`
- `$CTX.lookup($QUERY, ...)`
- `($LT: LdapTemplate)`
- `($LO: LdapOperations)`
- `($LT: org.springframework.ldap.core.LdapTemplate)`
- `($LO: org.springframework.ldap.core.LdapOperations)`
- `$CTX = LdapTemplate(...);...`
- `$CTX = LdapOperations(...);...`
- `$CTX = org.springframework.ldap.core.LdapTemplate(...);...`
- `$CTX = org.springframework.ldap.core.LdapOperations(...);...`
- `fun $FUNC(..., $VAR: String, ...) {
  ...
}`
- `$VAR`
- `fun $FUNC(..., $X: String, ...) {
  ...
  $VAR = ... + $X
  ...
}`
