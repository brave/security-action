---
name: oss/gitlab.find-sec-bugs.RSA-KEY-SIZE-1
rubric: safety
severity: should_fix
languages: [java]
---

**Rule.** The application is generating an RSA key that is less than the recommended 2048 bits. The National Institute of Standards and Technology (NIST) deprecated signing Digital Certificates that contained RSA Public Keys of 1024 bits in December 2010. While 1024-bit RSA keys have not been factored yet, advances in compute may make it possible in the near future. Consider upgrading to the newer asymmetric algorithm such as `Ed25519` which handles the complexities of generating key pairs and choosing correct key sizes for you: ``` public static KeyPair generateEd25519() throws NoSuchAlgorithmException { // Choose Ed25519 for KeyPairGenerator Instance KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("Ed25519"); // Generate a KeyPair and return return keyPairGenerator.generateKeyPair(); } ``` Otherwise use a key size greater than 2048 when generating RSA keys: ``` public static KeyPair generateRSA() throws NoSuchAlgorithmException { // Choose RSA for KeyPairGenerator Instance KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA"); // Initialize with 2048 key size keyPairGenerator.initialize(2048); // Generate a KeyPair and return return keyPairGenerator.generateKeyPair(); } ``` For more information on Ed25519 see: http://ed25519.cr.yp.to/ For more information on Java Cryptography see: https://docs.oracle.com/en/java/javase/15/security/java-cryptography-architecture-jca-reference-guide.html

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.find_sec_bugs.RSA_KEY_SIZE-1` (generated/oss/audit.yaml).

## Examples

Bad:

```java
$VAR.initialize($SIZE, ...);
new java.security.spec.RSAKeyGenParameterSpec($SIZE,...);
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs.RSA_KEY_SIZE-1` (metavariables start with `$`):

- `$GEN = KeyPairGenerator.getInstance($ALG, ...);
...`
- `$VAR.initialize($SIZE, ...);`
- `new java.security.spec.RSAKeyGenParameterSpec($SIZE,...);`
- `"(RSA|DSA)"`
