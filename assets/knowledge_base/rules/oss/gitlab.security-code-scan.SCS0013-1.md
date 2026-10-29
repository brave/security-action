---
name: oss/gitlab.security-code-scan.SCS0013-1
rubric: safety
severity: should_fix
languages: [csharp]
---

**Rule.** Cryptographic algorithms provide many different modes of operation, only some of which provide message integrity. Without message integrity it could be possible for an adversary to attempt to tamper with the ciphertext which could lead to compromising the encryption key. Newer algorithms apply message integrity to validate ciphertext has not been tampered with. Instead of using an algorithm that requires configuring a `CipherMode`, an algorithm that has built-in message integrity should be used. If using .NET Framework greater than version 6.0 consider using `ChaCha20Poly1305` or `AES-256-GCM`. For older applications, `AES-256-GCM` is recommended, however it has many drawbacks: - Slower than `ChaCha20Poly1305`. - Catastrophic failure if nonce values are re-used. Example using `ChaCha20Poly1305`: ``` // Generate a random key byte[] key = new byte[32]; RandomNumberGenerator.Fill(key); ChaCha20Poly1305 encryptor = new ChaCha20Poly1305(key); // Note nonce values _must_ be regenerated every time they are used. var nonce = new byte[12]; RandomNumberGenerator.Fill(nonce); byte[] plainText = System.Text.Encoding.UTF8.GetBytes("Secret text to encrypt"); byte[] cipherText = new byte[plainText.Length]; var authTag = new byte[16]; encryptor.Encrypt(nonce, plainText, cipherText, authTag); byte[] output = new byte[cipherText.Length]; encryptor.Decrypt(nonce, cipherText, authTag, output); Console.WriteLine("Output: {0}", System.Text.Encoding.UTF8.GetString(output)); ``` Example using `AES-256-GCM`: ``` var plaintextBytes = Encoding.UTF8.GetBytes("Secret text to encrypt"); var key = new byte[32]; RandomNumberGenerator.Fill(key); using var aes = new AesGcm(key); var nonce = new byte[AesGcm.NonceByteSizes.MaxSize]; RandomNumberGenerator.Fill(nonce); var cipherText = new byte[plaintextBytes.Length]; var tag = new byte[AesGcm.TagByteSizes.MaxSize]; aes.Encrypt(nonce, plaintextBytes, cipherText, tag); // Decrypt using (var decrypt = new AesGcm(key)) { var decryptedBytes = new byte[cipherText.Length]; decrypt.Decrypt(nonce, cipherText, tag, decryptedBytes); Console.WriteLine("Decrypted: {0}", Encoding.UTF8.GetString(decryptedBytes)); } ```

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.security_code_scan.SCS0013-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
CipherMode.$CIPHER
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0013-1` (metavariables start with `$`):

- `using System.Security.Cryptography;
...`
- `^(ECB|CBC|OFB|CFB|CTS)$`
- `CipherMode.$CIPHER`
