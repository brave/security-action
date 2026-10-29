---
name: oss/gitlab.bandit.B505-1
rubric: safety
severity: should_fix
languages: [python]
cwe: [CWE-326]
---

**Rule.** The application is generating an RSA key that is less than the recommended 2048 bits. The National Institute of Standards and Technology (NIST) deprecated signing Digital Certificates that contained RSA Public Keys of 1024 bits in December 2010. While 1024-bit RSA keys have not been factored yet, advances in compute may make it possible in the near future. Consider upgrading to the newer asymmetric algorithm such as `X25519` which handles the complexities of generating key pairs and choosing correct key sizes for you: ``` from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey # Generate a private key for use in the exchange. private_key = X25519PrivateKey.generate() # Work with private key/exchange with a peer's # public key to created a shared and derived key # ... ``` Otherwise use a key size greater than 2048 when generating RSA keys: ``` from cryptography.hazmat.primitives.asymmetric import rsa # Generate a private key of 4096 bits private_key = rsa.generate_private_key( # do not change the exponent value from 65537 public_exponent=65537, key_size=4096, ) # Work with the private key to sign/encrypt data # ... ``` For more information on using the cryptography module see: - https://cryptography.io/en/latest

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.bandit.B505-1` (generated/oss/audit.yaml).

## Examples

Bad:

```python
cryptography.hazmat.primitives.asymmetric.rsa.generate_private_key(...,key_size=$SIZE,...)
cryptography.hazmat.primitives.asymmetric.rsa.generate_private_key($EXP, $SIZE,...)
cryptography.hazmat.primitives.asymmetric.rsa.generate_private_key($SIZE, ...)
cryptography.hazmat.primitives.asymmetric.dsa.generate_private_key(...,key_size=$SIZE,...)
cryptography.hazmat.primitives.asymmetric.dsa.generate_private_key($EXP, $SIZE, ...)
cryptography.hazmat.primitives.asymmetric.dsa.generate_private_key($SIZE,...)
Crypto.PublicKey.RSA.generate($SIZE, ...)
Crypto.PublicKey.DSA.generate($SIZE, ...)
Cryptodome.PublicKey.DSA.generate($SIZE, ...)
Cryptodome.PublicKey.RSA.generate($SIZE, ...)
Crypto.PublicKey.DSA.generate(bits=$SIZE, ...)
Cryptodome.PublicKey.DSA.generate(bits=$SIZE, ...)
pycrypto_rsa.generate(bits=$SIZE, ...)
pycrypto_dsa.generate(bits=$SIZE, ...)
pycryptodomex_rsa.generate(bits=$SIZE, ...)
pycryptodomex_rsa.generate($SIZE, ...)
pycryptodomex_dsa.generate(bits=$SIZE, ...)
pycryptodomex_dsa.generate($SIZE, ...)
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B505-1` (metavariables start with `$`):

- `cryptography.hazmat.primitives.asymmetric.rsa.generate_private_key(...,key_size=$SIZE,...)`
- `cryptography.hazmat.primitives.asymmetric.rsa.generate_private_key($EXP, $SIZE,...)`
- `cryptography.hazmat.primitives.asymmetric.rsa.generate_private_key($SIZE, ...)`
- `cryptography.hazmat.primitives.asymmetric.dsa.generate_private_key(...,key_size=$SIZE,...)`
- `cryptography.hazmat.primitives.asymmetric.dsa.generate_private_key($EXP, $SIZE, ...)`
- `cryptography.hazmat.primitives.asymmetric.dsa.generate_private_key($SIZE,...)`
- `Crypto.PublicKey.RSA.generate($SIZE, ...)`
- `Crypto.PublicKey.DSA.generate($SIZE, ...)`
- `Cryptodome.PublicKey.DSA.generate($SIZE, ...)`
- `Cryptodome.PublicKey.RSA.generate($SIZE, ...)`
- `Crypto.PublicKey.DSA.generate(bits=$SIZE, ...)`
- `Cryptodome.PublicKey.DSA.generate(bits=$SIZE, ...)`
- `pycrypto_rsa.generate(bits=$SIZE, ...)`
- `pycrypto_dsa.generate(bits=$SIZE, ...)`
- `pycryptodomex_rsa.generate(bits=$SIZE, ...)`
- `pycryptodomex_rsa.generate($SIZE, ...)`
- `pycryptodomex_dsa.generate(bits=$SIZE, ...)`
- `pycryptodomex_dsa.generate($SIZE, ...)`
