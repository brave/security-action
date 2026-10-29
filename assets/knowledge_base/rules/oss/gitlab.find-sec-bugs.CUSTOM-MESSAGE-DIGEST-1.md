---
name: oss/gitlab.find-sec-bugs.CUSTOM-MESSAGE-DIGEST-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application was found implementing a custom `java.security.MessageDigest`. It is strongly recommended that a standard Digest algorithm be chosen instead as implementing a digest by hand is error-prone. The National Institute of Standards and Technology (NIST) recommends the use of SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224, or SHA-512/256. Example of creating a SHA-384 hash: ``` // Create a MessageDigest using the SHA-384 algorithm MessageDigest sha384Digest = MessageDigest.getInstance("SHA-384"); // Call update with your data sha384Digest.update(input); // Only call digest once all data has been fed into the update sha384digest instance byte[] output = sha384Digest.digest(); // output base64 encoded version of the hash System.out.println("hash: " + Base64.getEncoder().encodeToString(output)); ```

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs.CUSTOM_MESSAGE_DIGEST-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
class $CLAZZ extends java.security.MessageDigest {
  ...
}
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.CUSTOM_MESSAGE_DIGEST-1` (metavariables start with `$`):

- `class $CLAZZ extends java.security.MessageDigest {
  ...
}`
