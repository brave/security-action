---
name: oss/gitlab.find-sec-bugs-scala.CIPHER-INTEGRITY-1
rubric: safety
severity: should_fix
languages: [scala]
---

**Rule.** The ciphertext produced is susceptible to alteration by an adversary. This mean that the cipher provides no way to detect that the data has been tampered with. If the ciphertext can be controlled by an attacker, it could be altered without detection.

**Why.** Reported as CWE-353. Ported from opengrep rule `gitlab.find_sec_bugs_scala.CIPHER_INTEGRITY-1` (generated/oss/audit.yaml).

## Examples

Bad:

```text
(/CBC/PKCS5Padding)
(AES|DES(ede)?)(/ECB/*)
(AES|DES(ede)?)(/CBC/*)
(AES|DES(ede)?)(/OFB/*)
(AES|DES(ede)?)(/CTR/*)
```

Good:

```text
.*/(CCM|CWC|OCB|EAX|GCM)/.*
^(RSA)/.*
^(ECIES)$
```

## Detection hints

Literal patterns from opengrep rule `gitlab.find_sec_bugs_scala.CIPHER_INTEGRITY-1` (metavariables start with `$`):

- `javax.crypto.Cipher.getInstance("...")`
- `(/CBC/PKCS5Padding)`
- `(AES|DES(ede)?)(/ECB/*)`
- `(AES|DES(ede)?)(/CBC/*)`
- `(AES|DES(ede)?)(/OFB/*)`
- `(AES|DES(ede)?)(/CTR/*)`
- `.*/(CCM|CWC|OCB|EAX|GCM)/.*`
- `^(RSA)/.*`
- `^(ECIES)$`
