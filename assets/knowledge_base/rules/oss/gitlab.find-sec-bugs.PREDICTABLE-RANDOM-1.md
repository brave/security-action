---
name: oss/gitlab.find-sec-bugs.PREDICTABLE-RANDOM-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** Depending on the context, generating weak random numbers may expose cryptographic functions which rely on these numbers, to be exploitable. When generating numbers for sensitive values such as tokens, nonces, and cryptographic keys, it is recommended that the `DRBG` instance of `SecureRandom` be used. Example using `DRBG` with `SecureRandom`: ``` public SecureRandom getSecureRandomDRBG() throws NoSuchAlgorithmException { // Use DRBG according to http://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf return SecureRandom.getInstance("DRBG", // Security strength in bits (default is 128) DrbgParameters.instantiation(256, // Set prediction resistance and re-seeding DrbgParameters.Capability.PR_AND_RESEED, // Set the personalization string (optional, not necessary) "some_personalization_string".getBytes() ) ); } ``` For more information on Java Cryptography see: https://docs.oracle.com/en/java/javase/15/security/java-cryptography-architecture-jca-reference-guide.html

**Why.** Reported as CWE-330. Ported from opengrep rule `gitlab.find_sec_bugs.PREDICTABLE_RANDOM-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
java.util.Random $R = new java.util.Random();
...
$R.$METHOD();
(java.util.Random $R).$METHOD()
new java.util.Random().$METHOD()
org.apache.commons.lang.math.RandomUtils.$METHOD()
org.apache.commons.lang.RandomStringUtils.$METHOD(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.PREDICTABLE_RANDOM-1` (metavariables start with `$`):

- `java.util.Random $R = new java.util.Random();
...
$R.$METHOD();`
- `(java.util.Random $R).$METHOD()`
- `new java.util.Random().$METHOD()`
- `org.apache.commons.lang.math.RandomUtils.$METHOD()`
- `org.apache.commons.lang.RandomStringUtils.$METHOD(...)`
- `^(next|random)`
