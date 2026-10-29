---
name: oss/gitlab.find-sec-bugs.LDAP-ANONYMOUS-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application does not provide authentication when communicating an LDAP server. It is strongly recommended that the LDAP server be configured with authentication and restrict what queries users can execute. Example code that authenticates with a remote LDAP server and encodes any user-supplied input: ``` // Create a properties to hold the ldap connection details Properties props = new Properties(); // Use the com.sun.jndi.ldap.LdapCtxFactory factory provider props.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory"); // The LDAP server URL props.put(Context.PROVIDER_URL, "ldap://ldap.example.org:3889"); // User details for the connection props.put(Context.SECURITY_PRINCIPAL, "cn=admin,dc=example,dc=org"); // LDAP account password String ldapAccountPassword = getAccountPasswordFromSecureStoreOrKMS(); // Pass in the LDAP password props.put(Context.SECURITY_CREDENTIALS, ldapAccountPassword); // Create the LDAPContext InitialDirContext ldapContext = new InitialDirContext(props); // Example using SUBTREE_SCOPE SearchControls SearchControls searchControls = new SearchControls(); searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE); // Get user input for query String userQuery = someUserInput; // Use searchArguments to hold the user-supplied input Object[] searchArguments = new Object[]{userQuery}; // Hardcode the BaseDN, use the {0} format specifier to use the searchArguments array value, and pass in the search controls. // searchArguments automatically encode NamingEnumeration answer = ldapContext.search("dc=example,dc=org", "(cn={0})", searchArguments, searchControls); // Process the response answer while (answer.hasMoreElements()) { ... } ``` For information on enabling authentication, please see your LDAP server's documentation. For more information on LDAP Injection see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-306. Ported from opengrep rule `gitlab.find_sec_bugs.LDAP_ANONYMOUS-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$ENV.put(Context.SECURITY_AUTHENTICATION, "none");
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.LDAP_ANONYMOUS-1` (metavariables start with `$`):

- `import javax.naming.Context;
...`
- `$ENV.put(Context.SECURITY_AUTHENTICATION, "none");`
