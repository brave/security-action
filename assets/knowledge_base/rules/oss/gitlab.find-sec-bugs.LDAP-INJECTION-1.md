---
name: oss/gitlab.find-sec-bugs.LDAP-INJECTION-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** LDAP injection attacks exploit LDAP queries to influence how data is returned by the LDAP server. Later versions of Java's `InitialDirContext.search` introduced a four argument method, one of which is the `filterArg` parameter. The `filterArg` will be automatically encoded when querying the LDAP server. If this method signature is not available, the application must encode the LDAP strings manually. More details on the four argument `search` method can be found here: https://docs.oracle.com/en/java/javase/20/docs/api/java.naming/javax/naming/directory/InitialDirContext.html#search(javax.naming.Name,java.lang.String,java.lang.Object[],javax.naming.directory.SearchControls) To encode the string manually, it is recommended that all input passed to LDAP querying systems encode the following values: - Any occurrence of the null character must be escaped as “\00”. - Any occurrence of the open parenthesis character must be escaped as “\28”. - Any occurrence of the close parenthesis character must be escaped as “\29”. - Any occurrence of the asterisk character must be escaped as “\2a”. - Any occurrence of the backslash character must be escaped as “\5c”. Example function that safely encodes user-supplied input to be used in an LDAP query. ``` public static String encodeLDAPString(String input) { // Note the \ character is replaced first CharSequence[] chars = new CharSequence[] { "\\", "\0", "(", ")", "*" }; CharSequence[] encoded = new CharSequence[] { "\\5c", "\\00", "\\28", "\\29", "\\2a" }; // Iterate over each character sequence, replacing the raw value with an encoded version of it for (int i = 0; i < chars.length; i++) { // re-assign to input input = input.replace(chars[i], encoded[i]); } // return our modified input string return input; } ``` Example code that using the `filterArgs` parameter which automatically encodes for us: ``` // Create a properties to hold the ldap connection details Properties props = new Properties(); // Use the com.sun.jndi.ldap.LdapCtxFactory factory provider props.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory"); // The LDAP server URL props.put(Context.PROVIDER_URL, "ldap://ldap.example.org:3889"); // User details for the connection props.put(Context.SECURITY_PRINCIPAL, "cn=admin,dc=example,dc=org"); // LDAP account password String ldapAccountPassword = getAccountPasswordFromSecureStoreOrKMS(); // Pass in the LDAP password props.put(Context.SECURITY_CREDENTIALS, ldapAccountPassword); // Create the LDAPContext InitialDirContext ldapContext = new InitialDirContext(props); // Example using SUBTREE_SCOPE SearchControls SearchControls searchControls = new SearchControls(); searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE); // Get user input for query String userQuery = someUserInput; // Use searchArguments to hold the user-supplied input Object[] searchArguments = new Object[]{userQuery}; // Hardcode the BaseDN, use the {0} format specifier to use the searchArguments array value, and pass in the search controls. // searchArguments automatically encode NamingEnumeration answer = ldapContext.search("dc=example,dc=org", "(cn={0})", searchArguments, searchControls); // Process the response answer while (answer.hasMoreElements()) { ... } ``` For more information on LDAP Injection see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-90. Untrusted data matching the source patterns reaches the sink without passing a sanitizer. Ported from opengrep rule `gitlab.find_sec_bugs.LDAP_INJECTION-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// untrusted input (source)
$VAR
// flows to sink without sanitization
javax.naming.ldap.LdapName(...)
(javax.naming.directory.Context $C).lookup(...)
(javax.naming.Context $C).lookup(...)
$QUERY
$CTX.lookup(...)
$FILTER
(DirContext $C)
(InitialDirContext $IDC)
(LdapContext $LC)
(EventDirContext $EDC)
(LdapCtx $LC)
(javax.naming.directory.DirContext $C)
(javax.naming.directory.InitialDirContext $IDC)
(javax.naming.ldap.LdapContext $LC)
(javax.naming.event.EventDirContext $EDC)
(com.sun.jndi.ldap.LdapCtx $LC)
(LdapTemplate $LT)
(LdapOperations $LO)
(org.springframework.ldap.core.LdapTemplate $LT)
(org.springframework.ldap.core.LdapOperations $LO)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.LDAP_INJECTION-1` (metavariables start with `$`):

- `javax.naming.ldap.LdapName(...)`
- `(javax.naming.directory.Context $C).lookup(...)`
- `(javax.naming.Context $C).lookup(...)`
- `(com.unboundid.ldap.sdk.LDAPConnection $C).search($QUERY, ...)`
- `$QUERY`
- `$CTX.lookup(...)`
- `$CTX.search($QUERY, ...)`
- `$CTX.search($NAME, $FILTER, ...)`
- `$FILTER`
- `(DirContext $C)`
- `(InitialDirContext $IDC)`
- `(LdapContext $LC)`
- `(EventDirContext $EDC)`
- `(LdapCtx $LC)`
- `(javax.naming.directory.DirContext $C)`
- `(javax.naming.directory.InitialDirContext $IDC)`
- `(javax.naming.ldap.LdapContext $LC)`
- `(javax.naming.event.EventDirContext $EDC)`
- `(com.sun.jndi.ldap.LdapCtx $LC)`
- `$CTX.list($QUERY, ...)`
- `$CTX.lookup($QUERY, ...)`
- `(LdapTemplate $LT)`
- `(LdapOperations $LO)`
- `(org.springframework.ldap.core.LdapTemplate $LT)`
- `(org.springframework.ldap.core.LdapOperations $LO)`
- `$FUNC(..., $VAR, ...) {
  ...
}`
- `$VAR`
- `$FUNC(..., $X, ...) {
  ...
  $VAR = ... + $X;
  ...
}`
