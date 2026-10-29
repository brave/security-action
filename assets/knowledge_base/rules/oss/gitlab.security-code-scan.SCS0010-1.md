---
name: oss/gitlab.security-code-scan.SCS0010-1
rubric: safety
severity: should_fix
languages: [csharp]
cwe: [CWE-327]
---

**Rule.** DES, TripleDES and RC2 are all considered broken or insecure cryptographic algorithms. If using .NET Framework greater than version 6.0 consider using `ChaCha20Poly1305` instead as it is easier and faster than the alternatives such as `AES-256-GCM`. For older applications, `AES-256-GCM` is recommended, however it has many drawbacks: - Slower than `ChaCha20Poly1305`. - Catastrophic failure if nonce values are reused. Example using `ChaCha20Poly1305`: ``` // Generate a random key byte[] key = new byte[32]; RandomNumberGenerator.Fill(key); // Note nonce values _must_ be regenerated every time they are used. byte[] nonce = new byte[12]; RandomNumberGenerator.Fill(nonce); byte[] authTag = new byte[16]; byte[] cipherText; using (ChaCha20Poly1305 encryptor = new ChaCha20Poly1305(key)) { byte[] plainText = System.Text.Encoding.UTF8.GetBytes("Secret text to encrypt"); cipherText = new byte[plainText.Length]; encryptor.Encrypt(nonce, plainText, cipherText, authTag); } using (ChaCha20Poly1305 decryptor = new ChaCha20Poly1305(key)) { byte[] output = new byte[cipherText.Length]; decryptor.Decrypt(nonce, cipherText, authTag, output); Console.WriteLine("Output: {0}", System.Text.Encoding.UTF8.GetString(output)); } ``` Example using `AES-256-GCM`: ``` // Generate a random key byte[] key = new byte[32]; RandomNumberGenerator.Fill(key); // Note nonce values _must_ be regenerated every time they are used. byte[] nonce = new byte[AesGcm.NonceByteSizes.MaxSize]; RandomNumberGenerator.Fill(nonce); byte[] authTag = new byte[AesGcm.TagByteSizes.MaxSize]; byte[] cipherText; using (AesGcm encryptor = new AesGcm(key)) { byte[] plainText = Encoding.UTF8.GetBytes("Secret text to encrypt"); cipherText = new byte[plainText.Length]; encryptor.Encrypt(nonce, plainText, cipherText, authTag); } using (AesGcm decryptor = new AesGcm(key)) { byte[] output = new byte[cipherText.Length]; decryptor.Decrypt(nonce, cipherText, authTag, output); Console.WriteLine("Output: {0}", Encoding.UTF8.GetString(output)); } ```

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.security_code_scan.SCS0010-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
.*DES\.Create\(\);
new DESCryptoServiceProvider();
.*TripleDES\.Create\(\);
new TripleDESCryptoServiceProvider();
.*RC2\.Create\(\);
new RC2CryptoServiceProvider();
```

## Detection hints

Literal patterns from opengrep rule `gitlab.security_code_scan.SCS0010-1` (metavariables start with `$`):

- `using System.Security.Cryptography;
...`
- `.*DES\.Create\(\);`
- `new DESCryptoServiceProvider();`
- `.*TripleDES\.Create\(\);`
- `new TripleDESCryptoServiceProvider();`
- `.*RC2\.Create\(\);`
- `new RC2CryptoServiceProvider();`
