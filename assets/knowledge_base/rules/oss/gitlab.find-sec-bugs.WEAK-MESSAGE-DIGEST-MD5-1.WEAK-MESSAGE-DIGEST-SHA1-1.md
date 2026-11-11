---
name: oss/gitlab.find-sec-bugs.WEAK-MESSAGE-DIGEST-MD5-1.WEAK-MESSAGE-DIGEST-SHA1-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-327]
---

**Rule.** The application was found using an insecure or risky digest or signature algorithm. Both MD5 and SHA1 hash algorithms have been found to be vulnerable to producing collisions. This means that two different values, when hashed, can lead to the same hash value. If the application is trying to use these hash methods for storing passwords, then it is recommended to switch to a password hashing algorithm such as Argon2id or PBKDF2. strongly recommended that a standard Digest algorithm be chosen instead as implementing a digest by hand is error-prone. Example of creating a SHA-384 hash: ``` // Create a MessageDigest using the SHA-384 algorithm MessageDigest sha384Digest = MessageDigest.getInstance("SHA-384"); // Call update with your data sha384Digest.update(input); // Only call digest once all data has been fed into the update sha384digest instance byte[] output = sha384Digest.digest(); // output base64 encoded version of the hash System.out.println("hash: " + Base64.getEncoder().encodeToString(output)); ``` For more information on secure password storage see OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs.WEAK_MESSAGE_DIGEST_MD5-1.WEAK_MESSAGE_DIGEST_SHA1-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
java.security.MessageDigest.getInstance("$ALG", ...)
java.security.Signature.getInstance("$ALG", ...)
$PROP = (java.util.Properties $P).getProperty(..., "$ALG");
...
java.security.MessageDigest.getInstance("$ALG", ...);
$PROP = (java.util.Properties $P).getProperty(..., "$ALG");
...
java.security.Signature.getInstance("$ALG", ...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.WEAK_MESSAGE_DIGEST_MD5-1.WEAK_MESSAGE_DIGEST_SHA1-1` (metavariables start with `$`):

- `java.security.MessageDigest.getInstance("$ALG", ...)`
- `java.security.Signature.getInstance("$ALG", ...)`
- `$PROP = (java.util.Properties $P).getProperty(..., "$ALG");
...
java.security.MessageDigest.getInstance("$ALG", ...);`
- `$PROP = (java.util.Properties $P).getProperty(..., "$ALG");
...
java.security.Signature.getInstance("$ALG", ...);`
