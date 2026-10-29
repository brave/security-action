---
name: oss/gitlab.bandit.B505-2
rubric: safety
severity: should_fix
languages: [python]
---

**Rule.** The application was found using an insufficient curve size for the Elliptical Cryptography (EC) asymmetric algorithm. NIST recommends using a key size of 224 or greater. To remediate this issue, replace the current key size with `ec.SECP384R1`, Example using `ec.SECP384R1`: ``` from cryptography.hazmat.primitives.asymmetric import ec # Generate an EC private key using SECP384R1 private_key = ec.generate_private_key( ec.SECP384R1() ) # Work with/sign data using the key # ... ``` For more information on the cryptography module's EC section see: - https://cryptography.io/en/latest/hazmat/primitives/asymmetric/ec/

**Why.** Reported as CWE-326. Ported from opengrep rule `gitlab.bandit.B505-2` (generated/oss/audit.yaml).

## Examples

Bad:

```python
cryptography.hazmat.primitives.asymmetric.ec.$SIZE
SECP192R1
SECT163K1
SECT163R2
```

## Detection hints

Literal patterns from opengrep rule `gitlab.bandit.B505-2` (metavariables start with `$`):

- `cryptography.hazmat.primitives.asymmetric.ec.generate_private_key(...)`
- `cryptography.hazmat.primitives.asymmetric.ec.$SIZE`
- `SECP192R1`
- `SECT163K1`
- `SECT163R2`
