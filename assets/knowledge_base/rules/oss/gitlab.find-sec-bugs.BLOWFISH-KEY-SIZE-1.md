---
name: oss/gitlab.find-sec-bugs.BLOWFISH-KEY-SIZE-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The Blowfish encryption algorithm was meant as a drop-in replacement for DES and was created in 1993. Smaller key sizes may make the ciphertext vulnerable to [birthday attacks](https://en.wikipedia.org/wiki/Birthday_attack). While no known attacks against Blowfish exist, it should never be used to encrypt files over 4GB in size. If possible consider using AES as the instance of `KeyGenerator` instead of Blowfish. To remediate the small key size, pass a value such as 256 to the `KeyGenerator.init(keySize)` method. Example setting a larger key size and changing to `KeyGenerator` to AES: ``` public static void aesKeyGenerator() throws java.security.NoSuchAlgorithmException { // Use the AES algorithm for key generation KeyGenerator keyGenerator = KeyGenerator.getInstance("AES"); // Set the key size here keyGenerator.init(256); // get the raw bytes of the key byte[] key = keyGenerator.generateKey().getEncoded(); // pass the key bytes to create a SecretKeySpec SecretKeySpec secretKeySpec = new SecretKeySpec(key, "AES"); } ``` Example setting a larger key size for Blowfish: ``` public static void blowFishKeyGenerator() throws java.security.NoSuchAlgorithmException { // Use the Blowfish algorithm for key generation KeyGenerator keyGenerator = KeyGenerator.getInstance("Blowfish"); // Set the key size here keyGenerator.init(256); // get the raw bytes of the key byte[] key = keyGenerator.generateKey().getEncoded(); // pass the key bytes to create a SecretKeySpec SecretKeySpec secretKeySpec = new SecretKeySpec(key, "Blowfish"); } ``` For more information on Java Cryptography see: https://docs.oracle.com/en/java/javase/15/security/java-cryptography-architecture-jca-reference-guide.html

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs.BLOWFISH_KEY_SIZE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$KEYGEN.init($KEY_SIZE)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.BLOWFISH_KEY_SIZE-1` (metavariables start with `$`):

- `$KEYGEN = javax.crypto.KeyGenerator.getInstance("Blowfish", ...);
...`
- `$KEYGEN.init($KEY_SIZE)`
