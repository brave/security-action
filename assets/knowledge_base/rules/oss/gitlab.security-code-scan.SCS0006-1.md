---
name: oss/gitlab.security-code-scan.SCS0006-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** Both MD5 and SHA1 hash algorithms have been found to be vulnerable to producing collisions. This means that two different values, when hashed, can lead to the same hash value. If the application is trying to use these hash methods for storing passwords, then it is recommended to switch to a password hashing algorithm such as Argon2id or PBKDF2. Currently there is no vetted Argon2id implementation for C# so it is recommended that PBKDF2 be used until one is available. Example using PBKDF2 to generate and compare passwords: ``` const int SaltSize = 24; const int HashSize = 24; // number of pbkdf2 iterations, Rfc2898DeriveBytes uses hmac-sha1 // so set a high iteration count const int Iterations = 1_300_000; byte[] salt = new byte[SaltSize]; RandomNumberGenerator.Fill(salt); Rfc2898DeriveBytes pbkdf2 = new Rfc2898DeriveBytes("some password", salt, Iterations); byte[] hashBytes = pbkdf2.GetBytes(HashSize); // Store salt and hashedBytes in a data store such as database for authentication Console.WriteLine("Hash {0}", BitConverter.ToString(hashBytes).Replace("-", "")); // Do a constant time comparison as to not leak data based on timing if (CryptographicOperations.FixedTimeEquals(hashBytes, hashBytes)) { Console.WriteLine("hashes are equal"); } ``` For more information on PBKDF2 see: https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.rfc2898derivebytes For more information on secure password storage see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.security_code_scan.SCS0006-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
new $HASH_PROVIDER
$HASH_CLASS.$METHOD();
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0006-1` (metavariables start with `$`):

- `^(SHA1CryptoServiceProvider|MD5CryptoServiceProvider)$`
- `new $HASH_PROVIDER`
- `^System.Security.Cryptography.(SHA1|MD5)$`
- `$HASH_CLASS.$METHOD();`
