---
name: oss/gitlab.find-sec-bugs.RSA-NO-PADDING-1
rubric: safety
severity: should_fix
languages: [java]
cwe: [CWE-780]
---

**Rule.** The software uses the RSA algorithm but does not incorporate Optimal Asymmetric Encryption Padding (OAEP). By not enabling padding, the algorithm maybe vulnerable to [chosen plaintext attacks](https://en.wikipedia.org/wiki/Chosen-plaintext_attack). To enable OAEP mode, pass `RSA/ECB/OAEPWithSHA-256AndMGF1Padding` to the `Cipher.getInstance` method. Example encrypting and decrypting a message using RSA with OAEP: ``` public static void encryptWithRSA() throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException { // Generate an RSA Public and Private Key Pair KeyPair keyPair = generateRSAKeys(); // Create a Cipher instance using RSA, ECB with OAEP Cipher rsaEncryptor = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding"); // Initialize to ENCRYPT_MODE with the public key rsaEncryptor.init(Cipher.ENCRYPT_MODE, keyPair.getPublic()); // Encrypt our secret message byte[] cipherText = rsaEncryptor.doFinal("Some secret message".getBytes(StandardCharsets.UTF_8)); // Create a Cipher instance using RSA, ECB with OAEP Cipher rsaDecryptor = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding"); // Initialize to DECRYPT_MODE with the private key rsaDecryptor.init(Cipher.DECRYPT_MODE, keyPair.getPrivate()); // Decrypt the secret message byte[] plainText = rsaDecryptor.doFinal(cipherText); // Debug output System.out.println(new String(plainText)); } ``` More information on Optimal asymmetric encryption padding: https://en.wikipedia.org/wiki/Optimal_asymmetric_encryption_padding For more information on Java Cryptography see: https://docs.oracle.com/en/java/javase/15/security/java-cryptography-architecture-jca-reference-guide.html

**Why.** Reported as CWE-780. Ported from opengrep rule `gitlab.find_sec_bugs.RSA_NO_PADDING-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
javax.crypto.Cipher.getInstance("$ALG", ...)
$PROP = (java.util.Properties $P).getProperty(..., "$ALG");
...
javax.crypto.Cipher.getInstance($PROP, ...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.RSA_NO_PADDING-1` (metavariables start with `$`):

- `javax.crypto.Cipher.getInstance("$ALG", ...)`
- `$PROP = (java.util.Properties $P).getProperty(..., "$ALG");
...
javax.crypto.Cipher.getInstance($PROP, ...);`
- `(?i)^RSA/.*NoPadding$`
