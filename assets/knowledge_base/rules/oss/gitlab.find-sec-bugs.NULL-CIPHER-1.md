---
name: oss/gitlab.find-sec-bugs.NULL-CIPHER-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application was found creating a `NullCipher` instance. `NullCipher` implements the `Cipher` interface by returning ciphertext identical to the supplied plaintext. This means any data passed to the `doFinal(...)` or `update(...)` methods will not actually encrypt the input. Remove the NullCipher reference and replace with a legitimate `Cipher` instance such as `ChaCha20-Poly1305` Example using `ChaCha20Poly1305`: ``` public encrypt() throws Exception { chaChaEncryption("Secret text to encrypt".getBytes(StandardCharsets.UTF_8)); } public SecureRandom getSecureRandomDRBG() throws NoSuchAlgorithmException { // Use DRBG according to http://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf return SecureRandom.getInstance("DRBG", // Security strength in bits (default is 128) DrbgParameters.instantiation(256, // Set prediction resistance and re-seeding DrbgParameters.Capability.PR_AND_RESEED, // Set the personalization string (optional, not necessary) "some_personalization_string".getBytes() ) ); } public Cipher getChaCha20Poly1305(int mode, byte[] ivKey, byte[] secretKey) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException { // Get a DRBG random number generator instance SecureRandom random = getSecureRandomDRBG(); // Create a ChaCha20-Poly1305 cipher instance Cipher chaChaCipher = Cipher.getInstance("ChaCha20-Poly1305/None/NoPadding"); // Create our parameterSpec using our ivKey AlgorithmParameterSpec parameterSpec = new IvParameterSpec(ivKey); // Create a SecretKeySpec using our secretKey SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey, "ChaCha20"); // Initialize and return the cipher for the provided mode chaChaCipher.init(mode, secretKeySpec, parameterSpec, random); return chaChaCipher; } public void chaChaEncryption(byte[] plainText) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException { // Get a DRBG random number generator instance SecureRandom random = getSecureRandomDRBG(); // Create secretKey byte[] secretKey = new byte[32]; random.nextBytes(secretKey); // Create an IV Key byte[] ivKey = new byte[12]; random.nextBytes(ivKey); // Create a chaCha encryption cipher instance Cipher chaChaEncryptor = getChaCha20Poly1305(Cipher.ENCRYPT_MODE, ivKey, secretKey); // Encrypt the text using ChaCha20Poly1305 byte[] cipherText = null; try { cipherText = chaChaEncryptor.doFinal(plainText); } catch (IllegalBlockSizeException | BadPaddingException e) { System.out.println("failed to encrypt text"); return; } System.out.println("encrypted: " + Base64.getEncoder().encodeToString(cipherText)); // Create a chaCha decryption cipher instance Cipher chaChaDecryptor = getChaCha20Poly1305(Cipher.DECRYPT_MODE, ivKey, secretKey); // Decrypt the text byte[] decryptedText = null; try { decryptedText = chaChaDecryptor.doFinal(cipherText); } catch (IllegalBlockSizeException | BadPaddingException e) { System.out.println("failed to decrypt text"); return; } System.out.println("decrypted: " + new String(decryptedText, StandardCharsets.UTF_8)); } ``` For more information on Java Cryptography see: https://docs.oracle.com/en/java/javase/15/security/java-cryptography-architecture-jca-reference-guide.html

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.find_sec_bugs.NULL_CIPHER-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
// no static pattern; see Detection hints
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.NULL_CIPHER-1` (metavariables start with `$`):

- `new javax.crypto.NullCipher()`
