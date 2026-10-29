---
name: oss/gitlab.security-code-scan.SCS0026-1.SCS0031-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** LDAP injection attacks exploit LDAP queries to influence how data is returned by the LDAP, or in this case an Active Directory server. It is recommended that newer applications use the `System.DirectoryServices.AccountManagement` API instead of `DirectorySearcher` API as it hides the complexity of querying LDAP directly. However, the `AccountManagement` API is still susceptible to LDAP injection if a user inputs LDAP queries, including LDAP filter characters such as `*`. It is recommended that all input passed to LDAP querying systems encode the following values: - Any occurrence of the null character must be escaped as “\00”. - Any occurrence of the open parenthesis character must be escaped as “\28”. - Any occurrence of the close parenthesis character must be escaped as “\29”. - Any occurrence of the asterisk character must be escaped as “\2a”. - Any occurrence of the backslash character must be escaped as “\5c”. Example code that safely encodes input for use in an LDAP query using the `AccountManagement` API: ``` using System.DirectoryServices.AccountManagement; string EncodeLDAPString(string input) { // Note the \ character is replaced first char[] chars = new char[] { '\\', '\0', '(', ')', '*' }; string[] encoded = new string[] { "\\5c", "\\00", "\\28", "\\29", "\\2a" }; for (int i = 0; i < chars.Length; i++) { input = input.Replace(chars[i].ToString(), encoded[i]); } return input; } // unsafe, do not use without encoding first string userInput = "Administrator"; PrincipalContext AD = new PrincipalContext(ContextType.Domain, "ad.example.dev"); UserPrincipal u = new UserPrincipal(AD); string encodedUserName = EncodeLDAPString(userInput); // The AD search term, encoded prior to calling search u.SamAccountName = encodedUserName; // Search for user PrincipalSearcher search = new PrincipalSearcher(u); // Use FindOne to only return a single result UserPrincipal result = (UserPrincipal)search.FindOne(); search.Dispose(); // show some details if (result != null) { Console.WriteLine("User: {0}", result.DisplayName); } else { Console.WriteLine("user not found"); } ``` The same encoding method shown in `EncodeLDAPString` can also be used when using the older `DirectorySearcher` API. For more information see OWASP's guide: https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html

**Why.** Reported as CWE-90. Ported from opengrep rule `gitlab.security_code_scan.SCS0026-1.SCS0031-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
(DirectorySearcher $SOURCE).Filter = ...
(DirectorySearcher $SOURCE).Path = ...
```

Good:

```text
(DirectorySearcher $SOURCE).Filter = "..."
(DirectorySearcher $SOURCE).Path = "..."
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0026-1.SCS0031-1` (metavariables start with `$`):

- `(DirectorySearcher $SOURCE).Filter = ...`
- `(DirectorySearcher $SOURCE).Filter = "..."`
- `(DirectorySearcher $SOURCE).Path = ...`
- `(DirectorySearcher $SOURCE).Path = "..."`
