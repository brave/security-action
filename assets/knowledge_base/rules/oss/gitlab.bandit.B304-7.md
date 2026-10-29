---
name: oss/gitlab.bandit.B304-7
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-327]
---

**Rule.** The Blowfish encryption algorithm was meant as a drop-in replacement for DES and was created in 1993. Smaller key sizes may make the ciphertext vulnerable to [birthday attacks](https://en.wikipedia.org/wiki/Birthday_attack). While no known attacks against Blowfish exist, it should never be used to encrypt files over 4GB in size. If possible consider using ChaCha20Poly1305 or AES-GCM instead of Blowfish. For older applications that don't have support for `ChaCha20Poly1305`, `AES-256-GCM` is recommended, however it has many drawbacks: - Slower than `ChaCha20Poly1305`. - Catastrophic failure if nonce values are reused. Note that the `Crypto` and `Cryptodome` Python packages are no longer recommended for new applications, instead consider using the [cryptography](https://cryptography.io/) package. Example using `ChaCha20Poly1305`: ``` import os # Import ChaCha20Poly1305 from cryptography from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305 # Our plaintext to encrypt plain_text = b"Secret text to encrypt" # We do not require authenticated but unencrypted data, so set to None aad = None # Generate a secure key key = ChaCha20Poly1305.generate_key() # Create a new ChaCha20Poly1305 instance with our secure key chacha = ChaCha20Poly1305(key) # Note: nonce values _must_ be regenerated every time they are used. nonce = os.urandom(12) # Encrypt our plaintext cipher_text = chacha.encrypt(nonce, plain_text, aad) # Decrypt the plain text using the nonce and cipher_text chacha.decrypt(nonce, cipher_text, aad) ``` Example using `AESGCM`: ``` import os # Import AESGCM from cryptography from cryptography.hazmat.primitives.ciphers.aead import AESGCM # Our plaintext to encrypt plain_text = b"Secret text to encrypt" # We do not require authenticated but unencrypted data, so set to None aad = None # Generate a secure key key = AESGCM.generate_key(bit_length=128) # Create a new AESGCM instance with our secure key aesgcm = AESGCM(key) # Note: nonce values _must_ be regenerated every time they are used. nonce = os.urandom(12) # Encrypt our plaintext cipher_text = aesgcm.encrypt(nonce, plain_text, aad) # Decrypt the plain text using the nonce and cipher_text aesgcm.decrypt(nonce, cipher_text, aad) ``` For more information on the cryptography module see: - https://cryptography.io/en/latest/

**Why.** Reported as CWE-327. Ported from opengrep rule `gitlab.bandit.B304-7` (generated/oss/audit.yaml).

## Examples

Bad:

```python
Cryptodome.Cipher.Blowfish.new(...)
Crypto.Cipher.Blowfish.new(...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B304-7` (metavariables start with `$`):

- `Cryptodome.Cipher.Blowfish.new(...)`
- `Crypto.Cipher.Blowfish.new(...)`
